const megaAllowedInstruction = `Mega evolutions are allowed if the pokemon has one. Consider suggesting a mega evolution if it fits well with the team and the current meta.
If you want to suggest a mega evolution, set the pokemon name with -mega suffix and include a megaEvolvesFrom property with the name of the base pokemon. For example, if you want to suggest mega charizard y, set the name to "charizard-mega-y" and megaEvolvesFrom to "charizard".`;

const megaForbiddenInstruction = `Do not recommend mega evolutions.`;

export function normalizeGameName(gameName) {
  return typeof gameName === 'string'
    ? gameName.trim().toLowerCase().replace(/[\s-]+/g, '_')
    : '';
}

function buildAllowedListMessage(availablePokemonNames) {
  return availablePokemonNames.length > 0
    ? `You may only suggest one pokemon from this allowed list: ${JSON.stringify(availablePokemonNames)}.`
    : 'Choose any existing pokemon from any generation as the suggestion.';
}

export function buildPokemonSuggestionInstruction({
  agentInstructions,
  allowMega,
  availablePokemonNames,
}) {
  const megaInstruction = allowMega ? megaAllowedInstruction : megaForbiddenInstruction;
  const allowedListMessage = buildAllowedListMessage(availablePokemonNames);

  if (!agentInstructions ) {
    agentInstructions = 'You are an expert in Pokemon Video Game Championships (VGC). You are here to help people build their Pokemon teams for playing Pokemon Champions. The battle format is double battles'
  }

  return `
${agentInstructions}

${allowedListMessage}

${megaInstruction}`;
}

export function buildMoveSuggestionInstruction(agentInstructions) {
  return agentInstructions;
}
