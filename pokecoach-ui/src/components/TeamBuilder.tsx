import type { SelectedPokemon } from "../types/Pokemon.types";
import { TeamSlot } from "./TeamSlot";

interface Props {
  pokemons: SelectedPokemon[];
  onRemove: (index: number) => void;
  onUpdate: (updated: SelectedPokemon) => void;
}

export function TeamBuilder({ 
    pokemons, 
    onRemove,
    onUpdate
}: Props) {
  const emptySlots = 6 - pokemons.length;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        {/* <Users className="w-5 h-5 text-accent" /> */}
        <h2 className="font-display text-xl font-bold">Your Team</h2>
        <span className="text-muted-foreground text-sm font-display">{pokemons.length}/6</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {pokemons.map((p, i) => (
          <TeamSlot
            key={`${p.id}-${i}`}
            pokemon={p}
            onUpdate={onUpdate}
            onRemove={() => onRemove(i)}
            // onUpdate={(updated) => onUpdate(i, updated)}
          />
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="rounded-lg border-2 border-dashed border-border/50 h-24 flex items-center justify-center text-muted-foreground/40 font-display text-sm"
          >
            Empty Slot
          </div>
        ))}
      </div>
    </div>
  );
}