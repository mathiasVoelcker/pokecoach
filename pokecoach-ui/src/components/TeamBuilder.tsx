import { TeamSlot } from "./TeamSlot";
import { useTeamBuilderContext } from "./TeamBuilderContext";

export function TeamBuilder() {
  const {
    selectedPokemons,
    onClickAddPokemon,
    onClickUsePokeCoach,
    canAddPokemon,
    isUsingPokeCoach,
    retryingSuggestionIndex,
    showPokemonSearch,
    games,
    selectedGameName,
    onSelectedGameNameChange,
  } = useTeamBuilderContext();
  const emptySlots = 6 - selectedPokemons.length;
  return (
    <div className="flex flex-col h-full">
      <div className="flex lg:flex-row flex-col items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {/* <Users className="w-5 h-5 text-accent" /> */}
          <h2 className="font-display text-xl font-bold">Your Team</h2>
          <span className="text-muted-foreground text-sm font-display">{selectedPokemons.length}/6</span>
          <select
            value={selectedGameName}
            onChange={(e) => onSelectedGameNameChange(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-display text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Games</option>
            {games.map((game) => (
              <option key={game.id} value={game.name}>
                {game.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canAddPokemon || isUsingPokeCoach || retryingSuggestionIndex !== null}
            onClick={onClickUsePokeCoach}
            className="rounded-lg font-bold bg-cyan-500 px-4 py-2 text-sm font-display text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Use PokéCoach
          </button>
          <button
            type="button"
            onClick={onClickAddPokemon}
            disabled={!canAddPokemon}
            className="rounded-lg font-bold bg-primary px-4 py-2 text-sm font-display text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Pokemon
          </button>
        </div>
      </div>
      <div className={`flex-1 content-start overflow-y-auto pr-1 grid gap-3 ${showPokemonSearch ? "xl:grid-cols-2" : "lg:grid-cols-2"}`}>
        {selectedPokemons.map((p, i) => (
          <TeamSlot
            key={`${p.id}-${i}`}
            pokemon={p}
            index={i} //todo: manage mega evolution in the database
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
