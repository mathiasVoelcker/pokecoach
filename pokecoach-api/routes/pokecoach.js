import { Router } from 'express';
import { z } from 'zod';
import { getMovesByNames } from '../repositories/moveService.js';
import { getPokecoachAgent } from '../agents/geminiAgent.js';


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

const pokemonBaseSchema = z.object({
  id: z.number(),
  name: z.string(),
  artwork_id: z.number().nullable(),
  first_type: pokemonTypeSchema,
  second_type: pokemonTypeSchema.nullable(),
  mega_evolves_from: z.lazy(() => pokemonBaseSchema.nullable()),
  base_hp: z.number(),
  base_attack: z.number(),
  base_defense: z.number(),
  base_special_attack: z.number(),
  base_special_defense: z.number(),
  base_speed: z.number(),
});

const selectedPokemonSchema = pokemonBaseSchema.extend({
  moves: z.array(moveSchema),
  ability: z.string().nullable(),
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

  const baseFormPokemonName = pokecoachResponse.megaEvolvesFrom;
  const megaEvolvesFromData = baseFormPokemonName ? findPokemonByName(availablePokemons, baseFormPokemonName) : null;

  const moves = await getMovesByNames(pokecoachResponse.moves);

  return selectedPokemonSchema.parse({
    ...pokemonData,
    mega_evolves_from: megaEvolvesFromData,
    moves,
    ability: pokecoachResponse.ability,
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
    const agent = await getPokecoachAgent(selectedGameName);

    const pokecoachResponse = await agent.suggestPokemon({
      selectedPokemonList,
      previouslyRecommendedPokemon,
    });
    const suggestedPokemon = await buildSelectedPokemonFromResponse(
      pokecoachResponse,
      agent.availablePokemons
    );

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

    if (!Array.isArray(selectedPokemonList)) {
      return res.status(400).json({
        error: 'Request body must be an array of SelectedPokemon or an object with a team array.',
      });
    }

    const agent = await getPokecoachAgent(requestBody?.game);
    // todo: evaluate in the long run if this approach throws errors, and if we need to query for move names upfront
    const pokecoachRecommendedMove = await agent.suggestMove({
      selectedPokemonList,
      pokemonIdToAskForMove,
    });

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
