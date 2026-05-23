import { useCallback, useEffect, useState } from "react";
import { searchAbilities, type Ability } from "../lib/ability-api";
import type { SelectedPokemon } from "../types/Pokemon.types";
import { formatName } from "../utils/utils";

interface Props {
    pokemon: SelectedPokemon;
    disableMega: boolean;
    onUpdate: (updated: SelectedPokemon) => void;
}
// todo: revisit the disable mega logic. Will get this from database
export function TeamSlotAbility({ pokemon, disableMega, onUpdate }: Props) {
    const [pokemonAbilities, setPokemonAbilities] = useState<Ability[]>([]);

    const doAbilitySearch = useCallback(async () => {
        const searchedPokemonAbilities = await searchAbilities(pokemon.name);
        setPokemonAbilities(searchedPokemonAbilities);
    }, [pokemon.name]);

    useEffect(() => {
        if (pokemon.name && pokemonAbilities.length === 0) {
            doAbilitySearch();
        }
    }, [doAbilitySearch, pokemon.name, pokemonAbilities.length]);

    const setAbility = (ability: string) => {
        onUpdate({ ...pokemon, ability });
    };

    const toggleMega = () => {
        onUpdate({ ...pokemon, isMega: !pokemon.isMega });
    };

    return (
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
    );
}
