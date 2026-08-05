import { useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner"
import { useTeamBuilderContext } from "./TeamBuilderContext";
import { getTeamEval } from "../lib/pokecoach-api";
import type { TeamEvalResponse } from "../types/Pokemon.types";
import { TeamEvaluationDialog } from "./TeamEvaluationDialog";

export function TeamBuilderHeader() {
    const [teamEvaluation, setTeamEvaluation] = useState<TeamEvalResponse | null>(null);
    const [isEvaluatingTeam, setIsEvaluatingTeam] = useState(false);

    const {
        selectedPokemons,
        onClickAddPokemon,
        onClickUsePokeCoach,
        canAddPokemon,
        isUsingPokeCoach,
        retryingSuggestionIndex,
        games,
        loadingGames,
        selectedGameName,
        onSelectedGameNameChange,
      } = useTeamBuilderContext();

    const addPokemonButtonDisabled = !canAddPokemon 
    || loadingGames;

  const usePokeCoachButtonDisabled = !canAddPokemon
    || isUsingPokeCoach
    || retryingSuggestionIndex !== null
    || loadingGames;

  const onClickEvaluateTeam = async () => {
    setIsEvaluatingTeam(true);
    try {
      const evaluation = await getTeamEval({
        team: selectedPokemons,
        game: selectedGameName || null,
      });

      setTeamEvaluation(evaluation);
    } catch (error) {
      console.error("Failed to evaluate team:", error);
    } finally {
      setIsEvaluatingTeam(false);
    }
  };

    return (
        <div className="flex lg:flex-row flex-col items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {/* <Users className="w-5 h-5 text-accent" /> */}
          <h2 className="font-display text-xl font-bold">Your Team</h2>
          <span className="text-muted-foreground text-sm font-display">{selectedPokemons.length}/6</span>
          <div className="flex min-w-44 items-center gap-2">
            <select
              value={selectedGameName}
              onChange={(e) => onSelectedGameNameChange(e.target.value)}
              disabled={loadingGames}
              className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-display text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Games</option>
              {games.map((game) => (
                <option key={game.id} value={game.name}>
                  {game.name}
                </option>
              ))}
            </select>
            {loadingGames && (
              <LoadingSpinner
                className="h-4 w-4 text-muted-foreground"
                label="Loading games"
              />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={usePokeCoachButtonDisabled}
            onClick={onClickUsePokeCoach}
            className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-display font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUsingPokeCoach && <LoadingSpinner className="h-3.5 w-3.5" label="Getting PokéCoach suggestion" />}
            {isUsingPokeCoach ? "Thinking..." : "Use PokéCoach"}
          </button>
          <button
            type="button"
            onClick={onClickAddPokemon}
            disabled={addPokemonButtonDisabled}
            className="rounded-lg font-bold bg-primary px-4 py-2 text-sm font-display text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Pokemon
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClickEvaluateTeam}
            disabled={isEvaluatingTeam || loadingGames}
            className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-display font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isEvaluatingTeam && <LoadingSpinner className="h-3.5 w-3.5" label="Evaluating team" />}
            {isEvaluatingTeam ? "Evaluating..." : "Evaluate Team"}
          </button>
        </div>
        <TeamEvaluationDialog evaluation={teamEvaluation} onClose={() => setTeamEvaluation(null)} />
      </div>
    )
}
