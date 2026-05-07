import { useCallback, useEffect, useState } from "react";
import { getArtwork } from "../lib/pokemon-api";
import { formatName, normalizeSearchText } from "../utils/utils";
import { searchAbilities, type Ability } from "../lib/ability-api";
import { searchMoves, type Move } from "../lib/move-api";
import type { SelectedPokemon } from "../types/Pokemon.types";
import { ChevronDown, RotateCcw, X } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import { PokemonTypeStats } from "./PokemonTypeStats";
import { TypeBadge } from "./TypeBadge";


interface Props {
    pokemon: SelectedPokemon;
    disableMega: boolean;
    onRemove: () => void;
    onUpdate: (updated: SelectedPokemon) => void;
    onRetrySuggestion?: () => void;
    onAskPokeCoachForMove: () => void;
    isRetryingSuggestion?: boolean;
    disableRetrySuggestion?: boolean;
}


export const TeamSlot = ({
    pokemon,
    disableMega,
    onRemove,
    onUpdate,
    onRetrySuggestion,
    onAskPokeCoachForMove,
    isRetryingSuggestion = false,
    disableRetrySuggestion = false,
}: Props) => {

    const [pokemonAbilities, setPokemonAbilities] = useState<Ability[]>([]);
    const [pokemonMoves, setPokemonMoves] = useState<Move[]>([]);
    const [moveSearch, setMoveSearch] = useState("");
    const [showMoves, setShowMoves] = useState(false);

    const doAbilitySearch = useCallback(async () => {
        const searchedPokemonAbilities = await searchAbilities(pokemon.name);
        setPokemonAbilities(searchedPokemonAbilities);
    }, [pokemonAbilities]);

    const doMoveSearch = useCallback(async () => {
        const searchedPokemonMoves = await searchMoves(pokemon.name);
        setPokemonMoves(searchedPokemonMoves);
    }, [pokemonMoves]);

    useEffect(() => {
        if (pokemon.name && pokemonAbilities.length === 0) {
            doAbilitySearch();
        }
    }, [pokemonAbilities]);

    useEffect(() => {
        if (pokemon.name && pokemonMoves.length === 0) {
            doMoveSearch();
        }
    }, [pokemonMoves]);

    const normalizedMoveSearch = normalizeSearchText(moveSearch);
    const filteredMoves = pokemonMoves.filter(
        (m) => normalizeSearchText(m.name).includes(normalizedMoveSearch) && !pokemon.moves?.includes(m)
    );



    const setAbility = (ability: string) => {
        onUpdate({ ...pokemon, ability: ability });
    };

    const toggleMega = () => {
        onUpdate({ ...pokemon, isMega: !pokemon.isMega });
    };

    const removeMove = (move: Move) => {
        onUpdate({ ...pokemon, moves: pokemon.moves.filter((m) => m.id !== move.id) });
    };

    const addMove = (move: Move) => {
        if (pokemon.moves && pokemon.moves.length >= 4) return;
        onUpdate({ ...pokemon, moves: [...pokemon.moves, move] });
        setMoveSearch("");
    };

    return (
        <div className="rounded-lg bg-card border border-border p-4 relative group">
            <button
                onClick={onRemove}
                className="absolute top-2 right-2 rounded-full bg-destructive/20 p-1 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/40"
            >
                <X className="w-3 h-3" />
            </button>

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
                            <div className="relative group/pros">
                                <span className="cursor-default rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-display font-semibold uppercase tracking-wider text-emerald-300">
                                    Pros
                                </span>
                                <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-56 rounded-md border border-border bg-popover p-3 text-xs text-popover-foreground shadow-lg group-hover/pros:block">
                                    {pokemon.pros.length > 0 ? (
                                        <ul className="space-y-1">
                                            {pokemon.pros.map((pro) => (
                                                <li key={pro}>{pro}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No pros available.</p>
                                    )}
                                </div>
                            </div>
                            <div className="relative group/cons">
                                <span className="cursor-default rounded-md bg-rose-500/15 px-2 py-0.5 text-[11px] font-display font-semibold uppercase tracking-wider text-rose-300">
                                    Cons
                                </span>
                                <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-56 rounded-md border border-border bg-popover p-3 text-xs text-popover-foreground shadow-lg group-hover/cons:block">
                                    {pokemon.cons.length > 0 ? (
                                        <ul className="space-y-1">
                                            {pokemon.cons.map((con) => (
                                                <li key={con}>{con}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No cons available.</p>
                                    )}
                                </div>
                            </div>
                            {onRetrySuggestion && (
                                <button
                                    type="button"
                                    onClick={onRetrySuggestion}
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

            {/* Ability */}
            <div className="mb-3">
                <div className="mb-1 flex items-center justify-between gap-3">
                    <label className="text-[12px] uppercase tracking-wider text-muted-foreground font-display font-semibold block">
                        Ability
                    </label>
                    <label className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-muted-foreground font-display font-semibold cursor-pointer">
                        <input
                            type="checkbox"
                            checked={pokemon.isMega}
                            onChange={toggleMega}
                            disabled={disableMega}
                            className="h-3.5 w-3.5 rounded border-border accent-primary"
                        />
                        Mega
                    </label>
                </div>
                <div className="flex flex-wrap gap-1">
                    {pokemonAbilities?.map((ability) => (
                        <button
                            key={ability.name}
                            onClick={() => setAbility(ability.name)}
                            className={`rounded-md px-2 py-0.5 text-s font-display transition-colors ${pokemon.ability === ability.name
                                ? "bg-accent text-accent-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                }`}
                        >
                            {formatName(ability.name)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Moves */}
            <div>
                <label className="text-[12px] uppercase tracking-wider text-muted-foreground font-display font-semibold mb-1 block">
                    Moves
                </label>
                <div className="flex flex-wrap gap-1 mb-2">
                    {pokemon.moves?.map((m) => {
                        return (
                            <div
                                key={m?.id}
                                className="flex items-center gap-2 rounded-md bg-secondary/60 border border-border/50 px-2.5 py-1.5 w-xs"
                            >
                                <TypeBadge type={m.type} />
                                <span className="text-s font-display font-semibold flex-1 truncate">
                                    {formatName(m.name)}
                                </span>

                                <div className="flex items-center gap-2 text-[14px] text-muted-foreground font-display shrink-0">
                                    <span className="flex items-center gap-0.5" title={m.category}>
                                        <CategoryIcon category={m.category} />
                                        <span className="capitalize">{m.category.slice(0, 4)}</span>
                                    </span>
                                    <span title="Base Power">
                                        {m.base_power ?? "—"}
                                    </span>
                                </div>
                                <button onClick={() => removeMove(m)} className="text-muted-foreground hover:text-destructive shrink-0">
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
                                        onChange={(e) => setMoveSearch(e.target.value)}
                                        className="px-2 py-1.5 text-s bg-secondary border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none"
                                        autoFocus
                                    />
                                    <div className="overflow-y-auto flex-1">
                                        {filteredMoves.slice(0, 50).map((m) => (
                                            <button
                                                key={m.id}
                                                onClick={() => addMove(m)}
                                                className="block w-full text-left px-2 py-1 text-s font-display text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                            >
                                                {formatName(m.name)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => onAskPokeCoachForMove()}
                            className="shrink-0 rounded-md bg-cyan-500 px-2.5 py-1 text-s font-display font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                        >
                            Ask PokéCoach
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
