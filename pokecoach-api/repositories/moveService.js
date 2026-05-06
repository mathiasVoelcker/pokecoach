import supabase from '../db/supabase.js';

export const MOVE_SELECT = `
  id,
  name,
  base_power,
  category,
  type (
    id,
    name,
    color
  )
`;

export async function getMovesByPokemonName(pokemonName) {
  const { data, error } = await supabase
    .from('pokemon')
    .select(`
      pokemon_moves (
        move (
          ${MOVE_SELECT}
        )
      )
    `)
    .eq('name', pokemonName);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((pokemon) => pokemon.pokemon_moves)
    .flat()
    .map((pokemonMove) => pokemonMove.move);
}

export async function getMovesByNames(moveNames) {
  const normalizedMoveNames = moveNames.map((moveName) => moveName.trim()).filter(Boolean);

  if (normalizedMoveNames.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('move')
    .select(MOVE_SELECT)
    .in('name', normalizedMoveNames);

  if (error) {
    throw error;
  }

  const moveMap = new Map(
    (data ?? []).map((move) => [move.name, move])
  );

  return normalizedMoveNames
    .map((moveName) => moveMap.get(moveName))
    .filter(Boolean);
}
