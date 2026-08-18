import { Package, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getItemArtwork, searchItems, type Item } from "../lib/pokemon-api";
import type { SelectedPokemon } from "../types/Pokemon.types";
import { formatName } from "../utils/utils";

interface Props {
    pokemon: SelectedPokemon;
    onUpdate: (updated: SelectedPokemon) => void;
}

export function TeamSlotItem({ pokemon, onUpdate }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setLoading(false);
            setError(null);
            return;
        }

        let cancelled = false;
        const timer = window.setTimeout(async () => {
            setLoading(true);
            setError(null);

            try {
                const items = await searchItems(query);
                if (!cancelled) setResults(items);
            } catch (searchError) {
                if (!cancelled) {
                    setResults([]);
                    setError(searchError instanceof Error ? searchError.message : "Failed to search items.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 300);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [query]);

    const selectItem = (item: Item) => {
        onUpdate({ ...pokemon, item });
        setIsOpen(false);
        setQuery("");
    };

    const clearItem = () => onUpdate({ ...pokemon, item: null });

    return (
        <div className="absolute right-8 top-2 z-10">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary p-1 text-secondary-foreground transition-colors hover:bg-secondary/80"
                title={pokemon.item ? `Held item: ${formatName(pokemon.item.name)}` : "Add held item"}
            >
                {pokemon.item ? (
                    <img src={getItemArtwork(pokemon.item.name)} alt="" className="h-4 w-4 object-contain" />
                ) : (
                    <Package className="h-3 w-3" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-7 w-56 rounded-md border border-border bg-card p-2 shadow-lg">
                    <div className="mb-2 flex items-center gap-1">
                        <input
                            type="search"
                            autoFocus
                            placeholder="Search items..."
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            className="min-w-0 flex-1 rounded bg-secondary px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                        {pokemon.item && (
                            <button
                                type="button"
                                onClick={clearItem}
                                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                                title="Remove held item"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                        {loading && <p className="px-2 py-3 text-center text-xs text-muted-foreground">Searching…</p>}
                        {error && <p className="px-2 py-3 text-center text-xs text-destructive">{error}</p>}
                        {!loading && !error && query.trim() && results.length === 0 && (
                            <p className="px-2 py-3 text-center text-xs text-muted-foreground">No items found</p>
                        )}
                        {!query.trim() && (
                            <p className="px-2 py-3 text-center text-xs text-muted-foreground">Type an item name to search</p>
                        )}
                        {results.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => selectItem(item)}
                                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-secondary"
                            >
                                <img src={getItemArtwork(item.name)} alt="" className="h-7 w-7 shrink-0 object-contain" />
                                <span className="truncate font-display">{formatName(item.name)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
