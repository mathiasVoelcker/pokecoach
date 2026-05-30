import { createContext, useContext } from "react";
import type { Game } from "../lib/game-api";
import type { SelectedPokemon } from "../types/Pokemon.types";

export interface TeamBuilderContextValue {
  selectedPokemons: SelectedPokemon[];
  onRemove: (index: number) => void;
  onUpdate: (updated: SelectedPokemon) => void;
  onUpdateAtIndex: (index: number, updated: SelectedPokemon) => void;
  onClickAddPokemon: () => void;
  onClickUsePokeCoach: () => void;
  onRetryPokeCoachSuggestion: (index: number) => void;
  canAddPokemon: boolean;
  isUsingPokeCoach: boolean;
  retryingSuggestionIndex: number | null;
  askingMoveSuggestionIndex: number | null;
  showPokemonSearch: boolean;
  games: Game[];
  loadingGames: boolean;
  selectedGameName: string;
  onSelectedGameNameChange: (gameName: string) => void;
  onAskPokeCoachForMove: (index: number) => void;
}

export const TeamBuilderContext = createContext<TeamBuilderContextValue | null>(null);

export function useTeamBuilderContext() {
  const context = useContext(TeamBuilderContext);

  if (!context) {
    throw new Error("useTeamBuilderContext must be used within TeamBuilderContext.Provider");
  }

  return context;
}
