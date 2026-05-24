import type { SelectedPokemon } from "../types/Pokemon.types";
import { formatName } from "../utils/utils";
import { usePokemonAbilities } from "../hooks/usePokemonAbilities";

interface Props {
    pokemon: SelectedPokemon;
    onUpdate: (updated: SelectedPokemon) => void;
}
// todo: revisit the disable mega logic. Will get this from database
export function TeamSlotAbility({ pokemon, onUpdate }: Props) {
    const { pokemonAbilities } = usePokemonAbilities(pokemon.name);

    const setAbility = (ability: string) => {
        onUpdate({ ...pokemon, ability });
    };

    return (
        <div className="mb-3">
            <div className="mb-1 ">
                <label className="text-[12px] uppercase tracking-wider text-muted-foreground font-display font-semibold block">
                    Ability
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
