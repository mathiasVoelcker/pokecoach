import { StatBar } from "./StatBar";
import { TypeBadge } from "./TypeBadge";

interface PokemonType {
  id: number;
  name: string;
  color: string;
}

interface PokemonTypeStatsData {
  first_type: PokemonType;
  second_type?: PokemonType | null;
  base_hp: number;
  base_attack: number;
  base_defense: number;
  base_special_attack: number;
  base_special_defense: number;
  base_speed: number;
}

interface PokemonTypeStatsProps {
  pokemon: PokemonTypeStatsData;
}

export function PokemonTypeStats({ pokemon }: PokemonTypeStatsProps) {
  return (
    <>
      <div className="flex gap-1 mb-2">
        <TypeBadge type={pokemon.first_type} />
        {pokemon.second_type && <TypeBadge type={pokemon.second_type} />}
      </div>
      <div className="grid gap-0.5">
        <StatBar name="HP" value={pokemon.base_hp} compact />
        <StatBar name="Attack" value={pokemon.base_attack} compact />
        <StatBar name="Defense" value={pokemon.base_defense} compact />
        <StatBar name="Sp. Atk" value={pokemon.base_special_attack} compact />
        <StatBar name="Sp. Def" value={pokemon.base_special_defense} compact />
        <StatBar name="Speed" value={pokemon.base_speed} compact />
      </div>
    </>
  );
}
