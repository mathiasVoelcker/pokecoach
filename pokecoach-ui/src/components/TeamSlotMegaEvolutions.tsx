import { useEffect, useState } from "react";
import { getMegaEvolutions, type Pokemon } from "../lib/pokemon-api";
import type { SelectedPokemon } from "../types/Pokemon.types";
import { formatName } from "../utils/utils";
import { useTeamBuilderContext } from "./TeamBuilderContext";

export function TeamSlotMegaEvolutions({ pokemon, index }: { pokemon: SelectedPokemon, index: number }) {
    const { onUpdateAtIndex } = useTeamBuilderContext();
    const [megaEvolutions, setMegaEvolutions] = useState<Pokemon[]>([]);

    const basePokemon = pokemon.mega_evolves_from ?? pokemon;

    useEffect(() => {
        // todo: find a way to not fire this everytime switching between a mega evolution and its base form, since they have the same mega evolutions. Maybe we can cache the mega evolutions for each pokemon in a context or something like that
        const loadMegaEvolutions = async () => {
            const fetchedMegaEvolutions = await getMegaEvolutions(basePokemon.id);
            fetchedMegaEvolutions.forEach((megaEvolution) => megaEvolution.mega_evolves_from = basePokemon);
            setMegaEvolutions(fetchedMegaEvolutions);
        };

        loadMegaEvolutions();
    }, [basePokemon]);

    const selectMegaEvolution = (megaEvolution: Pokemon) => {
        if (pokemon.id === megaEvolution.id) {
            onUpdateAtIndex(index, {
                ...basePokemon,
                moves: pokemon.moves,
                ability: null,
                pros: pokemon.pros,
                cons: pokemon.cons,
                isPokecoachSuggestion: pokemon.isPokecoachSuggestion,
            })
        } else {
            onUpdateAtIndex(index, {
                ...megaEvolution,
                moves: pokemon.moves,
                ability: null,
                pros: pokemon.pros,
                cons: pokemon.cons,
                isPokecoachSuggestion: pokemon.isPokecoachSuggestion,
            });
        }
    };

    if (megaEvolutions.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            {megaEvolutions.map((megaEvolution) => (
                <label
                    key={megaEvolution.id}
                    className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-muted-foreground font-display font-semibold cursor-pointer"
                >
                    <input
                        type="checkbox"
                        checked={pokemon.id === megaEvolution.id}
                        onChange={() => selectMegaEvolution(megaEvolution)}
                        className="h-3.5 w-3.5 rounded border-border accent-primary"
                    />
                    {formatName(megaEvolution.name)}
                </label>
            ))}
        </div>
    );
}
