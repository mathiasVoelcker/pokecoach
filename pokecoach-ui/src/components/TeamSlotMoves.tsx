import { useCallback, useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { searchMoves, type Move } from "../lib/move-api";
import type { SelectedPokemon } from "../types/Pokemon.types";
import { formatName, normalizeSearchText } from "../utils/utils";
import { CategoryIcon } from "./CategoryIcon";
import { TypeBadge } from "./TypeBadge";

interface Props {
    pokemon: SelectedPokemon;
    onUpdate: (updated: SelectedPokemon) => void;
    onAskPokeCoachForMove: () => void;
}

export function TeamSlotMoves({ pokemon, onUpdate, onAskPokeCoachForMove }: Props) {
    const [pokemonMoves, setPokemonMoves] = useState<Move[]>([]);
    const [moveSearch, setMoveSearch] = useState("");
    const [showMoves, setShowMoves] = useState(false);

    const doMoveSearch = useCallback(async () => {
        const searchedPokemonMoves = await searchMoves(pokemon.name);
        setPokemonMoves(searchedPokemonMoves);
    }, [pokemon.name]);

    useEffect(() => {
        if (pokemon.name && pokemonMoves.length === 0) {
            doMoveSearch();
        }
    }, [doMoveSearch, pokemon.name, pokemonMoves.length]);

    const normalizedMoveSearch = normalizeSearchText(moveSearch);
    const filteredMoves = pokemonMoves.filter(
        (move) => normalizeSearchText(move.name).includes(normalizedMoveSearch) && !pokemon.moves?.includes(move)
    );

    const removeMove = (move: Move) => {
        onUpdate({ ...pokemon, moves: pokemon.moves.filter((currentMove) => currentMove.id !== move.id) });
    };

    const addMove = (move: Move) => {
        if (pokemon.moves && pokemon.moves.length >= 4) return;
        onUpdate({ ...pokemon, moves: [...pokemon.moves, move] });
        setMoveSearch("");
    };

    return (
        <div>
            <label className="text-[12px] uppercase tracking-wider text-muted-foreground font-display font-semibold mb-1 block">
                Moves
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
                {pokemon.moves?.map((move) => {
                    return (
                        <div
                            key={move?.id}
                            className="flex items-center gap-2 rounded-md bg-secondary/60 border border-border/50 px-2.5 py-1.5 w-xs"
                        >
                            <TypeBadge type={move.type} />
                            <span className="text-s font-display font-semibold flex-1 truncate">
                                {formatName(move.name)}
                            </span>

                            <div className="flex items-center gap-2 text-[14px] text-muted-foreground font-display shrink-0">
                                <span className="flex items-center gap-0.5" title={move.category}>
                                    <CategoryIcon category={move.category} />
                                    <span className="capitalize">{move.category.slice(0, 4)}</span>
                                </span>
                                <span title="Base Power">
                                    {move.base_power ?? "—"}
                                </span>
                            </div>
                            <button onClick={() => removeMove(move)} className="text-muted-foreground hover:text-destructive shrink-0">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    );
                }
                )}
            </div>
            {!pokemon.moves || pokemon.moves.length < 4 && (
                <div className="flex items-start gap-2">
                    <div className="relative flex-1">
                        <button
                            onClick={() => setShowMoves(!showMoves)}
                            className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-s font-display text-secondary-foreground hover:bg-secondary/80 transition-colors w-full justify-between"
                        >
                            Add move
                            <ChevronDown className={`w-3 h-3 transition-transform ${showMoves ? "rotate-180" : ""}`} />
                        </button>
                        {showMoves && (
                            <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-md bg-popover border border-border shadow-lg max-h-40 overflow-hidden flex flex-col">
                                <input
                                    type="text"
                                    placeholder="Filter moves..."
                                    value={moveSearch}
                                    onChange={(event) => setMoveSearch(event.target.value)}
                                    className="px-2 py-1.5 text-s bg-secondary border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none"
                                    autoFocus
                                />
                                <div className="overflow-y-auto flex-1">
                                    {filteredMoves.slice(0, 50).map((move) => (
                                        <button
                                            key={move.id}
                                            onClick={() => addMove(move)}
                                            className="block w-full text-left px-2 py-1 text-s font-display text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                        >
                                            {formatName(move.name)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onAskPokeCoachForMove}
                        className="shrink-0 rounded-md bg-cyan-500 px-2.5 py-1 text-s font-display font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                        Ask PokéCoach
                    </button>
                </div>
            )}
        </div>
    );
}
