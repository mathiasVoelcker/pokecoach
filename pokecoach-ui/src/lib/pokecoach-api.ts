import { API_BASE_URL } from "./config";
import type { ApiError } from "./pokemon-api";
import type { PokecoachRequest, SelectedPokemon } from "../types/Pokemon.types";

export async function getPokecoachSuggestion(requestBody: PokecoachRequest): Promise<SelectedPokemon> {
    const response = await fetch(`${API_BASE_URL}/pokecoach/pokemon`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error ?? `Request failed with status ${response.status}`);
    }

    return response.json();
}
