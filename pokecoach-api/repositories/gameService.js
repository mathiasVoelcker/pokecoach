import supabase from '../db/supabase.js';

export async function getGameByName(gameName) {
  const normalizedGameName = typeof gameName === 'string' ? gameName.trim() : '';

  if (!normalizedGameName) {
    return {}
  }

  const { data, error } = await supabase
    .from('game')
    .select(`
      name,
      agent_instructions,
      allow_mega,
      pokemon_game (
      pokemon (
          name
        )
      )
    `)
    .ilike('name', normalizedGameName)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
