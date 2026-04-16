import { getArtwork, type Pokemon } from "../lib/pokemon-api";
import { formatName } from "../utils/utils";
import { StatBar } from "./StatBar";
import { TypeBadge } from "./TypeBadge";

interface Props {
  pokemon: Pokemon;
  onAdd: (pokemon: Pokemon) => void;
  disabled: boolean;
}

export const PokemonSearchCard = ({ pokemon, onAdd, disabled }: Props) => {
    return (
    <div className="flex gap-4 items-start rounded-lg bg-card p-4 border border-border hover:border-primary/40 transition-colors">
      <img
        src={getArtwork(pokemon)}
        alt={pokemon.name}
        className="w-32 h-32 object-contain flex-shrink-0"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-display text-lg font-bold truncate">
            {formatName(pokemon.name)}
            <span className="text-muted-foreground font-normal ml-2 text-sm">
              #{pokemon.id}
            </span>
          </h3>
          <button
            onClick={() => onAdd(pokemon)}
            disabled={disabled}
            className="flex-shrink-0 rounded-md bg-primary px-3 py-1 text-xs font-display font-semibold text-primary-foreground hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            + Add
          </button>
        </div>
        <div className="flex gap-1 mb-2">
    
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
  );
};