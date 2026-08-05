import { normalizeGameName } from '../agents/gemini/instructions.js';

export function getGameCacheKey(gameName) {
  const normalizedGameName = normalizeGameName(gameName);
  return normalizedGameName || '__all__';
}
