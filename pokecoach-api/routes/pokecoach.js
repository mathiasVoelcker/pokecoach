import { Router } from 'express';
import { getMovesByNames } from '../repositories/moveService.js';
import { getAvailablePokemons } from '../repositories/pokemonServices.js';
import { buildSelectedPokemonFromResponse } from '../repositories/pokecoachService.js';
import { getPokecoachAgent } from '../agents/geminiAgent.js';


const router = Router();

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
    const availablePokemons = await getAvailablePokemons(agent.gameName);
    console.log('Available Pokemons:', availablePokemons.map(p => p.name));
    /*
      the data structured from the agent response does not contain all data needed. 
      We need to query on our database for pokemon stats, types and move details. 
      Agent should be as lightweight as possible, because querying from our SQL database is less expensive 
        and more reliable
    */
    const suggestedPokemon = await buildSelectedPokemonFromResponse(
      pokecoachResponse,
      availablePokemons
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

router.post('/eval', async (req, res) => {
  try {
    const requestBody = req.body;
    const selectedPokemonList = requestBody?.team;
    console.log(req.body)
    if (!Array.isArray(selectedPokemonList)) {
      return res.status(400).json({
        error: 'Request body must be an array of SelectedPokemon or an object with a team array.',
      });
    }

    const agent = await getPokecoachAgent(requestBody?.game);

    const teamEval = await agent.evaluateTeam({
      selectedPokemonList
    })
    console.log(teamEval)
    return res.json(teamEval)
  } catch (error) {
    console.error('Failed to generate team evaluation:', error);

    return res.status(500).json({
      error: 'Failed to generate team evaluation.',
    });
  }

})

export default router;
