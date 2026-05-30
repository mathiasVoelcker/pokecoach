import { getGamePokemonAvailability } from '../../services/gamePokemonAvailability.js';
import { normalizeGameName } from './instructions.js';
import { createPokecoachAgent } from './pokecoachAgentFactory.js';

const agentsByGameName = new Map();

// todo: move this to a common file, duplicate code with `gamePokemonAvailability`
function getCacheKey(gameName) {
  const normalizedGameName = normalizeGameName(gameName);
  return normalizedGameName || '__all__';
}

export async function getPokecoachAgent(gameName = null) {
  const cacheKey = getCacheKey(gameName);

  if (agentsByGameName.has(cacheKey)) {
    return agentsByGameName.get(cacheKey);
  }

  const availability = await getGamePokemonAvailability(gameName);
  const agent = createPokecoachAgent({ gameName, availability });

  agentsByGameName.set(cacheKey, agent);

  return agent;
}

export function clearPokecoachAgentCache() {
  agentsByGameName.clear();
}
