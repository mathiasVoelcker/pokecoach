import { useCallback, useEffect, useState } from "react";
import { searchMoves, type Move } from "../lib/move-api";
import { normalizeSearchText } from "../utils/utils";
import type { SelectedPokemon } from "../types/Pokemon.types";

export function usePokemonMoves(pokemon: SelectedPokemon) {
    const [pokemonMoves, setPokemonMoves] = useState<Move[]>([]);
    const [moveSearch, setMoveSearch] = useState("");

    const normalizedMoveSearch = normalizeSearchText(moveSearch);

    const filteredMoves = pokemonMoves.filter(
        (move) => normalizeSearchText(move.name).includes(normalizedMoveSearch) && !pokemon.moves?.includes(move)
    );

    const doMoveSearch = useCallback(async () => {
        //todo: this is to avoid searching again for moves when switching between a mega evolution and its base form, since they have the same moves. This is not working properly because we are fetching the moves anyways, need to rethink a way to cache these moves
        if (pokemon.name.includes("-mega") && filteredMoves.length > 0) {
            return;
        }
        const pokemonName = pokemon.mega_evolves_from?.name ?? pokemon.name;
        // mega evolutions have the same moves as their base form, we assume here that the moves have been queried already
        const searchedPokemonMoves = await searchMoves(pokemonName);
        setPokemonMoves(searchedPokemonMoves);    
    }, [pokemon]);

    useEffect(() => {
        if (pokemon.name && pokemonMoves.length === 0) {
            doMoveSearch();
        }
    }, [doMoveSearch, pokemon.name, pokemonMoves.length]);

    return { filteredMoves, moveSearch, setMoveSearch };
}
