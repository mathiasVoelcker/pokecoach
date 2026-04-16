import { useCallback, useEffect, useState } from "react";
import { getArtwork } from "../lib/pokemon-api";
import { formatName } from "../utils/utils";
import { StatBar } from "./StatBar";
import { TypeBadge } from "./TypeBadge";
import { searchAbilities, type Ability } from "../lib/ability-api";
import { searchMoves, type Move } from "../lib/move-api";
import type { SelectedPokemon } from "../types/Pokemon.types";
import { ChevronDown, X } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";


interface Props {
    pokemon: SelectedPokemon;
    onRemove: () => void;
    onUpdate: (updated: SelectedPokemon) => void;
}


export const TeamSlot = ({ pokemon, onRemove, onUpdate }: Props) => {

    const [pokemonAbilities, setPokemonAbilities] = useState<Ability[]>([]);
    const [pokemonMoves, setPokemonMoves] = useState<Move[]>([]);
    const [moveSearch, setMoveSearch] = useState("");
    const [showMoves, setShowMoves] = useState(false);

    const doAbilitySearch = useCallback(async () => {
        const searchedPokemonAbilities = await searchAbilities(pokemon.name);
        console.log(searchedPokemonAbilities)
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

    const filteredMoves = pokemonMoves.filter(
        // todo: not properly filtering move names with blank spaces, e.g. "Body Slam"
        (m) => m.name.includes(moveSearch.toLowerCase()) && !pokemon.moves?.includes(m)
    );



    const setAbility = (ability: string) => {
        onUpdate({ ...pokemon, ability: ability });
    };

    const removeMove = (move: Move) => {
        onUpdate({ ...pokemon, moves: pokemon.moves.filter((m) => m.id !== move.id) });
    };

    const addMove = (move: Move) => {
        // if (pokemon.moves && pokemon.moves.length >= 4) return;
        console.log(pokemon);
        console.log(move);
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
                    <div className="flex gap-1 mb-2">
                        {/*  todo: consider common component for types and stats for team slot and search card */}
                        <TypeBadge type={pokemon.first_type} />
                        {pokemon.second_type && (
                            <TypeBadge type={pokemon.second_type || { id: 0, name: "", color: "" }} />
                        )}
                    </div>
                    <div className="grid gap-0.5">
                        <StatBar name="HP" value={pokemon.base_hp} compact />
                        <StatBar name="Attack" value={pokemon.base_attack} compact />
                        <StatBar name="Defense" value={pokemon.base_defense} compact />
                        <StatBar name="Sp. Atk" value={pokemon.base_special_attack} compact />
                        <StatBar name="Sp. Def" value={pokemon.base_special_defense} compact />
                        <StatBar name="Speed" value={pokemon.base_speed} compact />
                    </div>
                </div>
            </div>

            {/* Ability */}
            <div className="mb-3">
                <label className="text-[12px] uppercase tracking-wider text-muted-foreground font-display font-semibold mb-1 block">
                    Ability
                </label>
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
                    <div className="relative">
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
                )}
            </div>
        </div>
    );
};