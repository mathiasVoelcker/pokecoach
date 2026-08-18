import { z } from 'zod';
import { getItemsByNames } from './itemService.js';
import { getMovesByNames } from './moveService.js';

const pokemonTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
});

const moveSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: pokemonTypeSchema,
  category: z.string(),
  base_power: z.number().nullable(),
});

const itemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
});

const pokemonBaseSchema = z.object({
  id: z.number(),
  name: z.string(),
  artwork_id: z.number().nullable(),
  first_type: pokemonTypeSchema,
  second_type: pokemonTypeSchema.nullable(),
  mega_evolves_from: z.lazy(() => pokemonBaseSchema.nullable()),
  base_hp: z.number(),
  base_attack: z.number(),
  base_defense: z.number(),
  base_special_attack: z.number(),
  base_special_defense: z.number(),
  base_speed: z.number(),
});

const selectedPokemonSchema = pokemonBaseSchema.extend({
  moves: z.array(moveSchema),
  ability: z.string().nullable(),
  item: itemSchema.nullable(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
});

function findPokemonByName(pokemons, pokemonName) {
  const normalizedPokemonName = pokemonName.trim().toLowerCase();

  const test = pokemons.filter((pokemon) => pokemon.name.toLowerCase() === 'salamence');
  console.log(test);

  return pokemons.find((pokemon) => pokemon.name.toLowerCase() === normalizedPokemonName)
    ?? pokemons.find((pokemon) => pokemon.name.toLowerCase().includes(normalizedPokemonName));
}

export async function buildSelectedPokemonFromResponse(pokecoachResponse, availablePokemons) {
  const pokemonData = findPokemonByName(availablePokemons, pokecoachResponse.name);

  if (!pokemonData) {
    throw new Error(`Suggested Pokemon is not available: ${pokecoachResponse.name}`);
  }

  const baseFormPokemonName = pokecoachResponse.megaEvolvesFrom;
  const megaEvolvesFromData = baseFormPokemonName
    ? findPokemonByName(availablePokemons, baseFormPokemonName)
    : null;
  const moves = await getMovesByNames(pokecoachResponse.moves);
  const [item] = await getItemsByNames([pokecoachResponse.item]);

  return selectedPokemonSchema.parse({
    ...pokemonData,
    mega_evolves_from: megaEvolvesFromData,
    moves,
    ability: pokecoachResponse.ability,
    item: item ?? null,
    pros: pokecoachResponse.pros,
    cons: pokecoachResponse.cons,
  });
}
