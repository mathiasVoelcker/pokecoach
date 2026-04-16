import { type PokemonType } from "../lib/pokemon-api";

interface TypeBadgeProps {
    type: PokemonType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
    return (
        <span
            style={{ backgroundColor: type.color }}
            className="inline-block rounded-full font-display font-bold uppercase font-display font-bold tracking-wider text-primary-foreground px-3 py-1 text-xs"
        >
            {type.name}
        </span>
    );
}
