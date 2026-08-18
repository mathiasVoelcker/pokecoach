import type { Move } from "../lib/move-api";
import { type Item, type Pokemon } from "../lib/pokemon-api";

export interface PokemonType {
  type: {id: string; name: string };
}

export interface SelectedPokemon extends Pokemon {
  moves: Move[];
  ability: string | null;
  item?: Item | null;
  pros: string[];
  cons: string[];
  isPokecoachSuggestion: boolean;
}

export interface TeamEvalResponse {
  grade: number;
  overallTeamDescription: string;
  pros: string[];
  cons: string[];
  howToPlayIt: string;
  whatShouldChange: string;
}

export interface PokecoachRequest {
  team: SelectedPokemon[];
  game: string | null;
  previouslyRecommendedPokemon?: string[];
}

export interface PokecoachMoveRequest {
  team: SelectedPokemon[];
  pokemonIdToAskForMove: number;
}
