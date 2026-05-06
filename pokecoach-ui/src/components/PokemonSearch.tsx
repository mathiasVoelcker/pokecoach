import { useEffect, useState } from "react";
import { type Pokemon, searchPokemon } from "../lib/pokemon-api";
import { PokemonSearchCard } from "./PokemonSearchCard";

interface Props {
    onAdd: (pokemon: Pokemon) => void;
    teamFull: boolean;
    gameName?: string;
}

export function PokemonSearch({ onAdd, teamFull, gameName }: Props) {

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }
            setLoading(true);
            const pokemons = await searchPokemon(query, gameName);
            setResults(pokemons);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [query, gameName]);

    return (
        <div className="flex flex-col h-full">
            <div className="relative mb-4">
                {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /> */}
                <input
                    type="text"
                    placeholder="Search Pokémon..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-lg bg-secondary border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {loading && results.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">Searching…</p>
                )}
                {!loading && query && results.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">No Pokémon found</p>
                )}
                {!query && (
                    <p className="text-center text-muted-foreground text-sm py-8">
                        Type a name to search for Pokémon
                    </p>
                )}
                {results.map((pokemon) => {
                    return (
                        <PokemonSearchCard
                            key={pokemon.name}
                            pokemon={pokemon}
                            onAdd={onAdd}
                            disabled={teamFull}
                        />
                    );
                })}
            </div>
        </div>
    );
}
