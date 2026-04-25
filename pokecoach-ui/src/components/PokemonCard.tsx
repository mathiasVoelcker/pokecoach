import { getArtwork, type Pokemon } from "../lib/pokemon-api";
import { formatName } from "../utils/utils";
import { StatBar } from "./StatBar";
import { TypeBadge } from "./TypeBadge";

interface PokemonCardProps {
  pokemon: Pokemon;
  compact?: boolean;
  showStats?: boolean;
  showTypes?: boolean;
  showImage?: boolean;
  showId?: boolean;
}

export function PokemonCard({
  pokemon,
  compact = false,
  showStats = true,
  showTypes = true,
  showImage = true,
  showId = false
}: PokemonCardProps) {
  return (
    <div className="flex gap-3">
      {showImage && (
        <img
          src={getArtwork(pokemon)}
          alt={pokemon.name}
          className={compact ? "w-20 h-20 object-contain" : "w-32 h-32 object-contain flex-shrink-0"}
        />
      )}
      <div className="flex-1 min-w-0">
        <h4 className={`font-display font-bold truncate ${compact ? "text-base" : "text-lg"}`}>
          {formatName(pokemon.name)}
          {showId && (
            <span className="text-muted-foreground font-normal ml-2 text-sm">
              #{pokemon.id}
            </span>
          )}
        </h4>
        {showTypes && (
          <div className="flex gap-1 mb-2">
            <TypeBadge type={pokemon.first_type} />
            {pokemon.second_type && (
              <TypeBadge type={pokemon.second_type} />
            )}
          </div>
        )}
        {showStats && (
          <div className="grid gap-0.5">
            <StatBar name="HP" value={pokemon.base_hp} compact={compact} />
            <StatBar name="Attack" value={pokemon.base_attack} compact={compact} />
            <StatBar name="Defense" value={pokemon.base_defense} compact={compact} />
            <StatBar name="Sp. Atk" value={pokemon.base_special_attack} compact={compact} />
            <StatBar name="Sp. Def" value={pokemon.base_special_defense} compact={compact} />
            <StatBar name="Speed" value={pokemon.base_speed} compact={compact} />
          </div>
        )}
      </div>
    </div>
  );
}