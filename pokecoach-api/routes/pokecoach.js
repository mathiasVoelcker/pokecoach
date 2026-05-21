import { Router } from 'express';
import { z } from 'zod';
import {
  getAvailablePokemons,
} from '../repositories/pokemonServices.js';
import { getMovesByNames } from '../repositories/moveService.js';
import { getMoveSuggestion, getPokemonSuggestion } from '../agents/geminiAgent.js';


const router = Router();

const pokemonTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
});

const moveSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: pokemonTypeSchema,
  category: z.string(),
  base_power: z.number().nullable(),
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

function findPokemonByName(pokemons, pokemonName) {
  const normalizedPokemonName = pokemonName.trim().toLowerCase();

  return pokemons.find((pokemon) => pokemon.name.toLowerCase() === normalizedPokemonName)
    ?? pokemons.find((pokemon) => pokemon.name.toLowerCase().includes(normalizedPokemonName));
}

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

// POST /pokecoach/pokemon
router.post('/pokemon', async (req, res) => {
  const requestBody = req.body;
  const selectedPokemonList = requestBody?.team;
  const selectedGameName = requestBody?.game;
  const previouslyRecommendedPokemon = Array.isArray(requestBody?.previouslyRecommendedPokemon)
    ? requestBody.previouslyRecommendedPokemon
    : [];

  if (!Array.isArray(selectedPokemonList)) {
    return res.status(400).json({
      error: 'Request body must be an array of SelectedPokemon or an object with a team array.',
    });
  }

  try {
    const availablePokemons = await getAvailablePokemons(selectedGameName);

    const availablePokemonNames = availablePokemons.map((pokemon) => pokemon.name)

    const pokecoachResponse = await getPokemonSuggestion(
      selectedPokemonList,
      selectedGameName ? availablePokemonNames : [], // if list is empty, the agent can choose any pokemon, otherwise it must choose from the list
      previouslyRecommendedPokemon
    );
    const suggestedPokemon = await buildSelectedPokemonFromResponse(pokecoachResponse, availablePokemons);

    return res.json(suggestedPokemon);
  } catch (error) {
    console.error('Failed to generate Pokemon suggestion:', error);

    return res.status(500).json({
      error: 'Failed to generate Pokemon suggestion.',
    });
  }
});

// POST /pokecoach/move
router.post('/move', async (req, res) => {
  try {
    const requestBody = req.body;
    const selectedPokemonList = requestBody?.team;
    const pokemonIdToAskForMove = requestBody?.pokemonIdToAskForMove;
    // todo: evaluate in the long run if this approach throws errors, and if we need to query for move names upfront
    const pokecoachRecommendedMove = await getMoveSuggestion(
      selectedPokemonList,
      pokemonIdToAskForMove
    );

    const recommendedMove = await getMovesByNames([pokecoachRecommendedMove]);
    if (recommendedMove.length === 0) {
      return res.status(404).json({
        error: `Recommended move not found in database: ${pokecoachRecommendedMove}`,
      });
    }

    return res.json(recommendedMove[0]);
  } catch (error) {
    console.error('Failed to generate move suggestion:', error);

    return res.status(500).json({
      error: 'Failed to generate move suggestion.',
    });
  }
})

export default router;
