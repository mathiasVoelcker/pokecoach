import supabase from '../db/supabase.js';

export const ITEM_SELECT = 'id, name, description';

export async function getItemsByNames(itemNames) {
  const normalizedItemNames = itemNames
    .filter((itemName) => typeof itemName === 'string')
    .map((itemName) => itemName.trim())
    .filter(Boolean);

  if (normalizedItemNames.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('item')
    .select(ITEM_SELECT)
    .in('name', normalizedItemNames);

  if (error) {
    throw error;
  }

  const itemMap = new Map((data ?? []).map((item) => [item.name, item]));

  return normalizedItemNames
    .map((itemName) => itemMap.get(itemName))
    .filter(Boolean);
}
