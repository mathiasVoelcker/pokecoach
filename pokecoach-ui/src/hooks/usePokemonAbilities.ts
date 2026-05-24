import { useCallback, useEffect, useState } from "react";
import { searchAbilities, type Ability } from "../lib/ability-api";

export function usePokemonAbilities(pokemonName: string) {
    const [pokemonAbilities, setPokemonAbilities] = useState<Ability[]>([]);

    const doAbilitySearch = useCallback(async () => {
        const searchedPokemonAbilities = await searchAbilities(pokemonName);
        setPokemonAbilities(searchedPokemonAbilities);
    }, [pokemonName]);

    useEffect(() => {
        if (pokemonName && pokemonAbilities.length === 0) {
            doAbilitySearch();
        }
    }, [doAbilitySearch, pokemonName, pokemonAbilities.length]);

    return { pokemonAbilities };
}
