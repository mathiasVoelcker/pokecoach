import { Router } from 'express';
import { Agent, run } from "@openai/agents";
import { z } from 'zod';
import supabase from '../db/supabase.js';

const router = Router();

const instructions = `You are an expert in Pokemon Video Game Championships (VGC). 
                You are here to help people build their Pokemon teams for playing Pokemon Champions, the new game launched.
                The goal is to build a team of 6 Pokemon that work well together and can win against other teams.
                The battle format is double battles.
                You will receive a partial team and must suggest exactly one Pokemon that complements it.
                Return exactly one SelectedPokemon object.
                Pick a strong complementary Pokemon species, plus a sensible ability and up to 4 moves.
                If you do not know exact ids or base stats, use 0 for numeric ids/stats.
                Use lowercase slug-style names like "incineroar" or "raging-bolt".
                Return structured data only.`;

const moveSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  category: z.string(),
  base_power: z.number().nullable(),
});

const pokemonTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
});

const selectedPokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  first_type: pokemonTypeSchema,
  second_type: pokemonTypeSchema.nullable(),
  base_hp: z.number(),
  base_attack: z.number(),
  base_defense: z.number(),
  base_special_attack: z.number(),
  base_special_defense: z.number(),
  base_speed: z.number(),
  moves: z.array(moveSchema),
  ability: z.string().nullable(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
});

const pokecoachResponseSchema = z.object({
    name: z.string(),
    moves: z.array(z.string()),
    ability: z.string().nullable(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
});

const agent = new Agent({
  name: "Pokecoach",
  instructions,
  model: "gpt-5.4-mini",
  outputType: pokecoachResponseSchema,
});

async function buildSelectedPokemonFromResponse(pokecoachResponse) {
  const { data: pokemonData, error: pokemonError } = await supabase
    .from('pokemon')
    .select(`
      id,
      name,
      base_hp,
      base_attack,
      base_defense,
      base_special_attack,
      base_special_defense,
      base_speed,
      first_type (
        id,
        name,
        color
      ),
      second_type (
        id,
        name,
        color
      )
    `)
    .eq('name', pokecoachResponse.name)
    .single();

  if (pokemonError || !pokemonData) {
    throw new Error(`Pokemon not found: ${pokecoachResponse.name}`);
  }

  const normalizedMoveNames = pokecoachResponse.moves.map((moveName) => moveName.trim()).filter(Boolean);

  let moves = [];

  if (normalizedMoveNames.length > 0) {
    const { data: moveData, error: moveError } = await supabase
      .from('move')
      .select(`
        id,
        name,
        base_power,
        category,
        type (
          name
        )
      `)
      .in('name', normalizedMoveNames);

    if (moveError) {
      throw moveError;
    }

    const moveMap = new Map(
      (moveData ?? []).map((move) => [
        move.name,
        {
          id: move.id,
          name: move.name,
          type: move.type?.name ?? '',
          category: move.category,
          base_power: move.base_power,
        },
      ])
    );

    moves = normalizedMoveNames
      .map((moveName) => moveMap.get(moveName))
      .filter(Boolean);
  }

  return selectedPokemonSchema.parse({
    ...pokemonData,
    moves,
    ability: pokecoachResponse.ability,
    pros: pokecoachResponse.pros,
    cons: pokecoachResponse.cons,
  });
}

router.post('/pokemon', async (req, res) => {
  const selectedPokemonList = Array.isArray(req.body) ? req.body : req.body?.team;

  if (!Array.isArray(selectedPokemonList)) {
    return res.status(400).json({
      error: 'Request body must be an array of SelectedPokemon or an object with a team array.',
    });
  }

  try {
    const prompt = `Here is the current Pokemon team as a JSON array of SelectedPokemon:
        ${JSON.stringify(selectedPokemonList, null, 2)}
        Suggest exactly one additional Pokemon that best complements this team in doubles play.
        Return only one SelectedPokemon object that matches the schema.
        Choose an ability and up to 4 moves for the suggestion.
        Also include a short list of pros and cons for adding this Pokemon to the team.`;

    const result = await run(agent, prompt);
    const suggestedPokemon = buildSelectedPokemonFromResponse(result.finalOutput);

    return res.json(await suggestedPokemon);
  } catch (error) {
    console.error('Failed to generate Pokemon suggestion:', error);

    return res.status(500).json({
      error: 'Failed to generate Pokemon suggestion.',
    });
  }
});

export default router;
