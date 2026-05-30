import { Type } from "@google/genai";
import { z } from 'zod';

export const pokecoachResponseSchema = z.object({
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

export const pokecoachResponseJsonSchema = {
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

export function parsePokemonSuggestion(responseText) {
  const parsedResponse = JSON.parse(responseText);
  const suggestion = Array.isArray(parsedResponse) ? parsedResponse[0] : parsedResponse;

  if (!suggestion) {
    throw new Error('Gemini returned no Pokemon suggestion.');
  }

  return pokecoachResponseSchema.parse(suggestion);
}
