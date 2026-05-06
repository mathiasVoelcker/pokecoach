import supabase from '../db/supabase.js';

export const POKEMON_BASE_SELECT = `
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
`;

export const POKEMON_SELECT_WITH_GAME_FILTER = `
${POKEMON_BASE_SELECT},
pokemon_game!inner (
  game!inner (
    id,
    name
  )
)
`;

export async function searchPokemons({ name, gameName = null }) {
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const normalizedGameName = typeof gameName === 'string' ? gameName.trim() : '';

  const query = supabase
    .from('pokemon')
    .select(normalizedGameName ? POKEMON_SELECT_WITH_GAME_FILTER : POKEMON_BASE_SELECT);

  if (normalizedName) {
    query.ilike('name', `%${normalizedName}%`);
  }

  if (normalizedGameName) {
    query.ilike('pokemon_game.game.name', `%${normalizedGameName}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getAvailablePokemons(gameName = null) {
  return searchPokemons({ gameName });
}
