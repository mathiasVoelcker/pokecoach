import { GoogleGenAI, Type } from "@google/genai";
import { z } from 'zod';

const ai = new GoogleGenAI({});

const instructions = `You are an expert in Pokemon Video Game Championships (VGC). 
                You are here to help people build their Pokemon teams for playing Pokemon Champions, the new game launched.
                The goal is to build a team of 6 Pokemon that work well together and can win against other teams.
                The battle format is double battles.
                You will receive a partial team and must suggest exactly one Pokemon that complements it.
                Return exactly one SelectedPokemon object.
                When suggesting the pokemon, also suggest an ability and exactly 4 moves for it.
                Pick a pokemon that fits well with the existing team and helps in winning battles in pokemon champions.
                You may only suggest Pokemon that are available in Pokemon Champions, which includes Pokemon from the first 9 generations, but not all of them.
                When suggesting the pokemon and moves, take into consideration that opponents will only have access to pokemons available in Pokemon Champions as well.
                Mega evolutions are allowed if the pokemon has one. Consider suggesting a mega evolution if it fits well with the team and the current meta.
                A team can only have one mega evolution, so don't suggest a mega evolution if the team already has one.
                If one of the existing pokemons in the team is mega evolution, consider the mega version of that pokemon when suggesting the new pokemon and moves.
                Use lowercase slug-style names. Do not use any special form names, only base pokemon names. For example, use "charizard" instead of "charizard-mega-x" or "charizard-mega-y".
                If you want to suggest a mega evolution, set the isMega property to true and still use the base pokemon name. For example, if you want to suggest mega charizard y, set the name to "charizard" and isMega to true.
                Return structured data only.`;

const pokecoachResponseSchema = z.object({
  name: z.string(),
  moves: z.array(z.string()).length(4),
  ability: z.string().nullable(),
  isMega: z.boolean(),
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
    isMega: {
      type: Type.BOOLEAN,
    },
    pros: stringArraySchema,
    cons: stringArraySchema,
  },
  required: ["name", "moves", "ability", "isMega", "pros", "cons"],
  propertyOrdering: ["name", "moves", "ability", "isMega", "pros", "cons"],
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
    const allowedListMessage = availablePokemonNames.length > 0
        ? `You may only suggest one pokemon from this allowed list: ${JSON.stringify(availablePokemonNames)}.`
        : "Choose any existing pokemon from any generation as the suggestion.";

    const previouslyRecommendedMessage = excludedPokemonNames.length > 0
        ? `Do not suggest any of the following pokemon that were previously recommended by PokéCoach: ${JSON.stringify(excludedPokemonNames)}.`
        : "";

        // todo: move this to db
    const prompt = `
    You are an expert in Pokemon Video Game Championships (VGC). 
    You are here to help people build their Pokemon teams for playing Pokemon Champions, the new game launched.
    The goal is to build a team of 6 Pokemon that work well together and can win against other teams.

	    Here is the current Pokemon team as a JSON array of SelectedPokemon:
	        ${JSON.stringify(selectedPokemonList, null, 2)}
            ${JSON.stringify(allowedListMessage)}
            ${JSON.stringify(previouslyRecommendedMessage)}
	        Suggest exactly one additional Pokemon that best complements this team in doubles play.
        Return only one SelectedPokemon object that matches the schema.
        Mega evolutions are allowed if the pokemon has one. Consider suggesting a mega evolution if it fits well with the team and the current meta.
        If you want to suggest a mega evolution, set the isMega property to true and still use the base pokemon name. For example, if you want to suggest mega charizard y, set the name to "charizard" and isMega to true.
        Use lowercase slug-style names. Do not use any special form names, only base pokemon names. For example, use "charizard" instead of "charizard-mega-x" or "charizard-mega-y".
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