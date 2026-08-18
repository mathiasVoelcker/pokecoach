import { getArtwork } from "../lib/pokemon-api";
import { formatName } from "../utils/utils";
import type { SelectedPokemon } from "../types/Pokemon.types";
import { RotateCcw, X } from "lucide-react";
import { PokemonTypeStats } from "./PokemonTypeStats";
import { SuggestionDetail } from "./SuggestionDetail";
import { useTeamBuilderContext } from "./TeamBuilderContext";
import { TeamSlotAbility } from "./TeamSlotAbility";
import { TeamSlotMegaEvolutions } from "./TeamSlotMegaEvolutions";
import { TeamSlotMoves } from "./TeamSlotMoves";
import { TeamSlotItem } from "./TeamSlotItem";

interface Props {
    pokemon: SelectedPokemon;
    index: number;
}

export const TeamSlot = ({
    pokemon,
    index,
}: Props) => {
    const {
        onRemove,
        onUpdate,
        onRetryPokeCoachSuggestion,
        isUsingPokeCoach,
        retryingSuggestionIndex,
    } = useTeamBuilderContext();

    const isRetryingSuggestion = retryingSuggestionIndex === index;
    const disableRetrySuggestion = isUsingPokeCoach || retryingSuggestionIndex !== null;

    return (
        <div className="rounded-lg bg-card border border-border p-4 relative group">
            <button
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 rounded-full bg-destructive/20 p-1 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/40"
            >
                <X className="w-3 h-3" />
            </button>
            <TeamSlotItem pokemon={pokemon} onUpdate={onUpdate} />

            <div className="flex gap-3 mb-3">
                <img
                    src={getArtwork(pokemon)}
                    alt={pokemon.name}
                    className="w-20 h-20 object-contain"
                />
                <div className="flex-1 min-w-0">
                    <h4 className="font-display text-base font-bold truncate">
                        {formatName(pokemon.name)}
                    </h4>
                    <PokemonTypeStats pokemon={pokemon} />
                    {pokemon.isPokecoachSuggestion && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <SuggestionDetail
                                label="Pros"
                                items={pokemon.pros}
                                tone="pros"
                            />
                            <SuggestionDetail
                                label="Cons"
                                items={pokemon.cons}
                                tone="cons"
                            />
                            {pokemon.isPokecoachSuggestion && (
                                <button
                                    type="button"
                                    onClick={() => onRetryPokeCoachSuggestion(index)}
                                    disabled={disableRetrySuggestion}
                                    className="inline-flex items-center gap-1 rounded-md bg-cyan-500/15 px-2 py-0.5 text-[11px] font-display font-semibold uppercase text-cyan-200 transition-colors hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Get a different PokéCoach suggestion"
                                >
                                    <RotateCcw className={`h-3 w-3 ${isRetryingSuggestion ? "animate-spin" : ""}`} />
                                    Retry
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between gap-3">
                <TeamSlotAbility
                    pokemon={pokemon}
                    onUpdate={onUpdate}
                />
                <TeamSlotMegaEvolutions
                    pokemon={pokemon}
                    index={index}
                />
            </div>
            
            <TeamSlotMoves
                pokemon={pokemon}
                index={index}
            />
        </div>
    );
};
