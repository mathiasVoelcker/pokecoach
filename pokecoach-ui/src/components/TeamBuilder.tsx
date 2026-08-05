import { TeamSlot } from "./TeamSlot";
import { useTeamBuilderContext } from "./TeamBuilderContext";
import { TeamBuilderHeader } from "./TeamBuilderHeader";

export function TeamBuilder() {
  const {
    selectedPokemons,
    showPokemonSearch,
  } = useTeamBuilderContext();
  const emptySlots = 6 - selectedPokemons.length;

  return (
    <div className="flex flex-col h-full">
      <TeamBuilderHeader />
      <div className={`flex-1 content-start overflow-y-auto pr-1 grid gap-3 ${showPokemonSearch ? "xl:grid-cols-2" : "lg:grid-cols-2"}`}>
        {selectedPokemons.map((p, i) => (
          <TeamSlot
            key={`${p.id}-${i}`}
            pokemon={p}
            index={i}
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
