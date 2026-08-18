import { Type } from "@google/genai";
import { z } from 'zod';

export const pokecoachResponseSchema = z.object({
  name: z.string(),
  moves: z.array(z.string()).length(4),
  ability: z.string().nullable(),
  megaEvolvesFrom: z.string().nullable(),
  item: z.string().nullable(),
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
    item: {
      type: Type.STRING,
      nullable: true,
      description: "Lowercase held item name, or null when no item is recommended.",
    },
    pros: stringArraySchema,
    cons: stringArraySchema,
  },
  required: ["name", "moves", "ability", "megaEvolvesFrom", "item", "pros", "cons"],
  propertyOrdering: ["name", "moves", "ability", "megaEvolvesFrom", "item", "pros", "cons"],
};

export const pokecoachEvalResponseJsonSchema = {
  type: Type.OBJECT,
  properties: {
    grade: {
      type: Type.NUMBER,
      description: "Grade for the team, from 0 to 10, allowing decimals"
    },
    overallTeamDescription: {
      type: Type.STRING,
      description: "A brief description on how the team works"
    },
    pros: {
      ...stringArraySchema,
      description: "list the strengths of this team"
    },
    cons: {
      ...stringArraySchema,
      description: "list the weakness of this team"
    },
    howToPlayIt: {
      type: Type.STRING,
      description: "a brief description on how you would use this team to play the game"
    },
    whatShouldChange: {
      type: Type.STRING,
      description: "A brief description what would you change on this team"
    }
  },
  required: ["grade", "overallTeamDescription", "howToPlayIt", "pros", "cons"],
}

export function parsePokemonSuggestion(responseText) {
  const parsedResponse = JSON.parse(responseText);
  const suggestion = Array.isArray(parsedResponse) ? parsedResponse[0] : parsedResponse;

  if (!suggestion) {
    throw new Error('Gemini returned no Pokemon suggestion.');
  }

  return pokecoachResponseSchema.parse(suggestion);
}
