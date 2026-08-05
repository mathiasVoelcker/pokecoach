import { getGameCacheKey } from '../common/utils.js';
import { getAvailablePokemons } from '../repositories/pokemonServices.js';
import { buildAllowedListMessage } from '../agents/gemini/instructions.js';

const availabilityByGameName = new Map();

// todo: refactor this, should belong to repositories folder
export async function getGamePokemonAvailability(gameName = null) {
  const cacheKey = getGameCacheKey(gameName);

  if (availabilityByGameName.has(cacheKey)) {
    return availabilityByGameName.get(cacheKey);
  }

  const availablePokemons = await getAvailablePokemons(gameName);
  const availablePokemonNames = availablePokemons.map((pokemon) => pokemon.name);

  const availability = {
    availablePokemons,
    allowedListMessage: buildAllowedListMessage(availablePokemonNames),
    anyMega: availablePokemonNames.some((name) => name.includes('mega')),
  };

  availabilityByGameName.set(cacheKey, availability);

  return availability;
}

export function clearGamePokemonAvailabilityCache() {
  availabilityByGameName.clear();
}
