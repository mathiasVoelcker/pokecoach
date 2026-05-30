const baseInstructions = `You are an expert in Pokemon.
You are here to help people build their Pokemon teams.
A pokemon team consists of 6 Pokemon that work well together and can win against other teams.
Choose Pokemon for a general Pokemon team.
`;

const gameAgentConfigs = {
  pokemon_champions: {
    instruction: `You are an expert in Pokemon Video Game Championships (VGC).
You are here to help people build their Pokemon teams for playing Pokemon Champions.
The battle format is double battles.`,
  },
  pokemon_fire_red: {
    instruction: `You are an expert in Pokemon Fire Red.
You are here to help people build practical in-game teams for a Pokemon Fire Red playthrough.
The battle format is single battles.`,
  },
  pokemon_leaf_green: {
    instruction: `You are an expert in Pokemon Leaf Green.
You are here to help people build practical in-game teams for a Pokemon Leaf Green playthrough.
The battle format is single battles.`,
  },
};

const megaAllowedInstruction = `Mega evolutions are allowed if the pokemon has one. Consider suggesting a mega evolution if it fits well with the team and the current meta.
If you want to suggest a mega evolution, set the pokemon name with -mega suffix and include a megaEvolvesFrom property with the name of the base pokemon. For example, if you want to suggest mega charizard y, set the name to "charizard-mega-y" and megaEvolvesFrom to "charizard".`;

const megaForbiddenInstruction = `Do not recommend mega evolutions.`;

const specialFormInstruction = `If the pokemon has a special form that is relevant to the suggestion, like galarian or alolan forms, you can specify the form in the name using a suffix, for example "meowth-galarian".
This also applies to pokemon forms like rotom-wash or aegislash-blade.
Only add a pokemon special form if that form is included on the provided list of available pokemon.`;

export function normalizeGameName(gameName) {
  return typeof gameName === 'string'
    ? gameName.trim().toLowerCase().replace(/[\s-]+/g, '_')
    : '';
}

export function getGameAgentConfig(gameName) {
  const normalizedGameName = normalizeGameName(gameName);

  return gameAgentConfigs[normalizedGameName] ?? {
    instruction: baseInstructions,
  };
}

export function buildAllowedListMessage(availablePokemonNames) {
  return availablePokemonNames.length > 0
    ? `You may only suggest one pokemon from this allowed list: ${JSON.stringify(availablePokemonNames)}.`
    : "Choose any existing pokemon from any generation as the suggestion.";
}

export function buildPokemonSuggestionInstruction({ gameName, allowedListMessage, anyMega }) {
  const gameConfig = getGameAgentConfig(gameName);
  const megaInstruction = anyMega ? megaAllowedInstruction : megaForbiddenInstruction;

  return `
${gameConfig.instruction}

${allowedListMessage}

${megaInstruction}

${specialFormInstruction}`;
}

export function buildMoveSuggestionInstruction(gameName) {
  const gameConfig = getGameAgentConfig(gameName);

  return `$
  ${gameConfig.instruction}`;
}
