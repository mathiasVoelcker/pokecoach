import { GoogleGenAI, Type } from "@google/genai";
import { z } from 'zod';

const ai = new GoogleGenAI({});

const instructions = `You are an expert in Pokemon. 
                You are here to help people build their Pokemon teams,
                A pokemon team consists of 6 Pokemon that work well together and can win against other teams.
                Each pokemon can learn up to 4 moves and has one ability.
                Use lowercase slug-style names.
                Return structured data only.`;

const pokecoachResponseSchema = z.object({
  name: z.string(),
  moves: z.array(z.string()).length(4),
  ability: z.string().nullable(),
  megaEvolvesFrom: z.string().nullable(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
});

const stringArraySchema = {
  type: Type.ARRAY,
  items: { type: Type.STRING },
};

const pokecoachResponseJsonSchema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "Lowercase base Pokemon name from the allowed list.",
    },
    moves: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      minItems: "4",
      maxItems: "4",
      description: "Exactly four move names.",
    },
    ability: {
      type: Type.STRING,
      nullable: true,
    },
    megaEvolvesFrom: {
      type: Type.STRING,
      nullable: true,
      description: "If suggesting a mega evolution, the name of the base Pokemon. Otherwise null.",
    },
    pros: stringArraySchema,
    cons: stringArraySchema,
  },
  required: ["name", "moves", "ability", "pros", "cons"],
  propertyOrdering: ["name", "moves", "ability", "megaEvolvesFrom", "pros", "cons"],
};

function parsePokemonSuggestion(responseText) {
  const parsedResponse = JSON.parse(responseText);
  const suggestion = Array.isArray(parsedResponse) ? parsedResponse[0] : parsedResponse;

  if (!suggestion) {
    throw new Error('Gemini returned no Pokemon suggestion.');
  }

  return pokecoachResponseSchema.parse(suggestion);
}

export const getPokemonSuggestion = async (selectedPokemonList, availablePokemonNames, excludedPokemonNames) => {
    const gameSpecificPrompt = `
      You are an expert in Pokemon Video Game Championships (VGC). 
      You are here to help people build their Pokemon teams for playing Pokemon Champions, the new game launched.
      The battle format is double battles.
    `
    
    const allowedListMessage = availablePokemonNames.length > 0
        ? `You may only suggest one pokemon from this allowed list: ${JSON.stringify(availablePokemonNames)}.`
        : "Choose any existing pokemon from any generation as the suggestion.";

    const previouslyRecommendedMessage = excludedPokemonNames.length > 0
        ? `Do not suggest any of the following pokemon that were previously recommended by PokéCoach: ${JSON.stringify(excludedPokemonNames)}.`
        : "";
    
    const anyMega = availablePokemonNames.some(name => name.includes('mega'));
    const megaEvolutionPrompt = anyMega ? `
        Mega evolutions are allowed if the pokemon has one. Consider suggesting a mega evolution if it fits well with the team and the current meta.
        If you want to suggest a mega evolution, set the pokemon name with -mega suffix and include a megaEvolvesFrom property with the name of the base pokemon. For example, if you want to suggest mega charizard y, set the name to "charizard-mega-y" and megaEvolvesFrom to "charizard".
    ` : "Do not recomend mega evolutions";

    const specialFormPrompt = `
        If the pokemon has a special form that is relevant to the suggestion (like galarian or alolan forms), you can specify the form in the name using a suffix (for example "meowth-galarian").
        This also applies to pokemon forms like rotom-wash or aegislash-blade.
        Only add a pokemon special form if that form is included on the provided list of available pokemon
    `


        // todo: move this to db
    const prompt = `
      ${gameSpecificPrompt}
	    Here is the current Pokemon team as a JSON array of SelectedPokemon:
	        ${JSON.stringify(selectedPokemonList, null, 2)}
            ${allowedListMessage}
            ${previouslyRecommendedMessage}
	      Suggest exactly one additional Pokemon that best complements this team.
        ${megaEvolutionPrompt}
        ${specialFormPrompt}
        Choose an ability and exactly 4 moves for the suggestion.
        Also include a short list of pros and cons for adding this Pokemon to the team.`;


    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            systemInstruction: instructions,
            responseMimeType: "application/json",
            responseSchema: pokecoachResponseJsonSchema,
        },
    });
    console.log(response.text);
    return parsePokemonSuggestion(response.text);
}

export const getMoveSuggestion = async (selectedPokemonList, pokemonIdToAskForMove) => {
    const prompt = `
    You are an expert in Pokemon Video Game Championships (VGC). 
    You are here to help people build their Pokemon teams for playing Pokemon Champions, the new game launched.
    The goal is to build a team of 6 Pokemon that work well together and can win against other teams.

        Here is the current Pokemon team as a JSON array of SelectedPokemon:
            ${JSON.stringify(selectedPokemonList, null, 2)}
            For the pokemon with id ${pokemonIdToAskForMove}, suggest one move that it doesn't currently have but would be a good addition to the moveset. Consider the current meta and the rest of the team when suggesting the move.
        Return only the name of the move as a string. Use lowercase slug-style names. Do not include any additional text.`;
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            systemInstruction: instructions,
            responseMimeType: "text/plain",
        },
    });
    console.log(response.text);
    return response.text;
}