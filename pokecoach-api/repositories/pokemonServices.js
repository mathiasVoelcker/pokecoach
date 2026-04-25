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

export function findPokemonByName(pokemons, pokemonName) {
  const normalizedPokemonName = pokemonName.trim().toLowerCase();

  return pokemons.find((pokemon) => pokemon.name.toLowerCase() === normalizedPokemonName)
    ?? pokemons.find((pokemon) => pokemon.name.toLowerCase().includes(normalizedPokemonName));
}

export async function getMovesByNames(moveNames) {
  const normalizedMoveNames = moveNames.map((moveName) => moveName.trim()).filter(Boolean);

  if (normalizedMoveNames.length === 0) {
    return [];
  }

  const { data, error } = await supabase
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

  if (error) {
    throw error;
  }

  const moveMap = new Map(
    (data ?? []).map((move) => [
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

  return normalizedMoveNames
    .map((moveName) => moveMap.get(moveName))
    .filter(Boolean);
}
