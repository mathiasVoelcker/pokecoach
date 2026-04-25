import { Router } from 'express';
import { Agent, run } from "@openai/agents";
import { z } from 'zod';
import {
  findPokemonByName,
  getAvailablePokemons,
  getMovesByNames,
} from '../repositories/pokemonServices.js';

const router = Router();

const instructions = `You are an expert in Pokemon Video Game Championships (VGC). 
                You are here to help people build their Pokemon teams for playing Pokemon Champions, the new game launched.
                The goal is to build a team of 6 Pokemon that work well together and can win against other teams.
                The battle format is double battles.
                You will receive a partial team and must suggest exactly one Pokemon that complements it.
                Return exactly one SelectedPokemon object.
                When suggesting the pokemon, also suggest an ability and up to 4 moves for it.
                Pick a pokemon that fits well with the existing team and helps in winning battles in pokemon champions.
                You may only suggest Pokemon that are available in Pokemon Champions, which includes Pokemon from the first 9 generations, but not all of them.
                When suggesting the pokemon and moves, take into consideration that opponents will only have access to pokemons available in Pokemon Champions as well.
                Mega evolutions are allowed if the pokemon has one. Consider suggesting a mega evolution if it fits well with the team and the current meta.
                A team can only have one mega evolution, so don't suggest a mega evolution if the team already has one.
                If one of the existing pokemons in the team is mega evolution, consider the mega version of that pokemon when suggesting the new pokemon and moves.
                Use lowercase slug-style names. Do not use any special form names, only base pokemon names. For example, use "charizard" instead of "charizard-mega-x" or "charizard-mega-y".
                If you want to suggest a mega evolution, set the isMega property to true and still use the base pokemon name. For example, if you want to suggest mega charizard y, set the name to "charizard" and isMega to true.
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
  isMega: z.boolean(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
});

const pokecoachResponseSchema = z.object({
    name: z.string(),
    moves: z.array(z.string()),
    ability: z.string().nullable(),
    isMega: z.boolean(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
});

const agent = new Agent({
  name: "Pokecoach",
  instructions,
  model: "gpt-5.4-mini",
  outputType: pokecoachResponseSchema,
});

async function buildSelectedPokemonFromResponse(pokecoachResponse, availablePokemons) {
  const pokemonData = findPokemonByName(availablePokemons, pokecoachResponse.name);

  if (!pokemonData) {
    throw new Error(`Suggested Pokemon is not available: ${pokecoachResponse.name}`);
  }

  const moves = await getMovesByNames(pokecoachResponse.moves);

  return selectedPokemonSchema.parse({
    ...pokemonData,
    moves,
    ability: pokecoachResponse.ability,
    isMega: pokecoachResponse.isMega,
    pros: pokecoachResponse.pros,
    cons: pokecoachResponse.cons,
  });
}

router.post('/pokemon', async (req, res) => {
  const requestBody = req.body;
  const selectedPokemonList = requestBody?.team;
  const selectedGameName = requestBody?.game;

  if (!Array.isArray(selectedPokemonList)) {
    return res.status(400).json({
      error: 'Request body must be an array of SelectedPokemon or an object with a team array.',
    });
  }

  try {
    const availablePokemons = await getAvailablePokemons(selectedGameName);

    if (availablePokemons.length === 0) {
      return res.status(404).json({
        error: selectedGameName
          ? `No pokemon found for game: ${selectedGameName}`
          : 'No pokemon found.',
      });
    }

    const availablePokemonNames = availablePokemons.map((pokemon) => pokemon.name);

    const prompt = `Here is the current Pokemon team as a JSON array of SelectedPokemon:
        ${JSON.stringify(selectedPokemonList, null, 2)}
        The selected game filter is: ${selectedGameName ? `"${selectedGameName}"` : 'none'}.
        You may only suggest one pokemon from this allowed list:
        ${JSON.stringify(availablePokemonNames)}
        Suggest exactly one additional Pokemon that best complements this team in doubles play.
        Return only one SelectedPokemon object that matches the schema.
        Choose an ability and up to 4 moves for the suggestion.
        Also include a short list of pros and cons for adding this Pokemon to the team.`;

    const result = await run(agent, prompt);
    const suggestedPokemon = await buildSelectedPokemonFromResponse(result.finalOutput, availablePokemons);

    return res.json(suggestedPokemon);
  } catch (error) {
    console.error('Failed to generate Pokemon suggestion:', error);

    return res.status(500).json({
      error: 'Failed to generate Pokemon suggestion.',
    });
  }
});

export default router;
