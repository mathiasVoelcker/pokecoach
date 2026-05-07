import { API_BASE_URL } from "./config";
import type { ApiError } from "./pokemon-api";
import type { PokecoachMoveRequest, PokecoachRequest, SelectedPokemon } from "../types/Pokemon.types";
import type { Move } from "./move-api";

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

export async function getMoveSuggestion(requestBody: PokecoachMoveRequest): Promise<Move> {
    const response = await fetch(`${API_BASE_URL}/pokecoach/move`, {
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


