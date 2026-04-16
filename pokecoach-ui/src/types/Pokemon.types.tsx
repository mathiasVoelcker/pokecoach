import type { Ability } from "../lib/ability-api";
import type { Move } from "../lib/move-api";
import { type Pokemon } from "../lib/pokemon-api";

export interface PokemonType {
  type: {id: string; name: string };
}


// export interface Pokemon {
//     id: number;
//     name: string;
//     spriteUrl: string;
//     type1: PokemonType
//     type2: PokemonType;
//     baseHp: number;
//     baseAttack: number;
//     baseDefense: number;
//     baseSpecialAttack: number;
//     baseSpecialDefense: number;
//     baseSpeed: number;
// }

// export interface Move {
//     id: number;
//     name: string;
//     type: PokemonType;
//     power: number;
// }

//TODO refactor to organize types in one single file and export from there
export interface SelectedPokemon extends Pokemon {
  moves: Move[];
  ability: string;
}