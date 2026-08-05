import { getGameCacheKey } from '../../common/utils.js';
import { getGameByName } from '../../repositories/gameService.js';
import { createPokecoachAgent } from './pokecoachAgentFactory.js';

const agentsByGameName = new Map();

export async function getPokecoachAgent(gameName = null) {
  const cacheKey = getGameCacheKey(gameName);

  if (agentsByGameName.has(cacheKey)) {
    return agentsByGameName.get(cacheKey);
  }

  const game = await getGameByName(gameName);
  const agent = createPokecoachAgent(game);

  agentsByGameName.set(cacheKey, agent);

  return agent;
}

export function clearPokecoachAgentCache() {
  agentsByGameName.clear();
}
