import { ai } from './client.js';
import {
  buildMoveSuggestionInstruction,
  buildPokemonSuggestionInstruction,
} from './instructions.js';
import {
  parsePokemonSuggestion,
  pokecoachResponseJsonSchema,
} from './schemas.js';

export function createPokecoachAgent({ gameName, availability }) {
  const pokemonSuggestionInstruction = buildPokemonSuggestionInstruction({
    gameName,
    allowedListMessage: availability.allowedListMessage,
    anyMega: availability.anyMega,
  });
  const moveSuggestionInstruction = buildMoveSuggestionInstruction(gameName);

  return {
    availablePokemons: availability.availablePokemons,

    async suggestPokemon({ selectedPokemonList, previouslyRecommendedPokemon = [] }) {
      const previouslyRecommendedMessage = previouslyRecommendedPokemon.length > 0
        ? `Do not suggest any of the following pokemon that were previously recommended by PokéCoach: ${JSON.stringify(previouslyRecommendedPokemon)}.`
        : "";

      const prompt = `
        Suggest exactly one additional Pokemon that best complements this team.
        Choose an ability and exactly 4 moves for the suggestion.
        Use lowercase slug-style names.
        Also include a short list of pros and cons for adding this Pokemon to the team.
        Here is the current Pokemon team as a JSON array of SelectedPokemon:
        ${JSON.stringify(selectedPokemonList, null, 2)}
        ${previouslyRecommendedMessage}
        `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: pokemonSuggestionInstruction,
          responseMimeType: "application/json",
          responseSchema: pokecoachResponseJsonSchema,
        },
      });

      console.log(response.text);

      return parsePokemonSuggestion(response.text);
    },

    async suggestMove({ selectedPokemonList, pokemonIdToAskForMove }) {
      const prompt = `
        Here is the current Pokemon team as a JSON array of SelectedPokemon:
        ${JSON.stringify(selectedPokemonList, null, 2)}

        For the pokemon with id ${pokemonIdToAskForMove}, suggest one move that it doesn't currently have but would be a good addition to the moveset.
        Consider the current meta and the rest of the team when suggesting the move.
        Return only the name of the move as a string.
        Use lowercase slug-style names.
        Do not include any additional text.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: moveSuggestionInstruction,
          responseMimeType: "text/plain",
        },
      });

      console.log(response.text);

      return response.text;
    },
  };
}
