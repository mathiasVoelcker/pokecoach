import type { ApiError } from "./pokemon-api";
import { API_BASE_URL } from './config';

export interface Ability {
    name: string;
}

export async function searchAbilities(query: string): Promise<Ability[]> {
    const params = new URLSearchParams({ pokemonName: query });
    const response = await fetch(`${API_BASE_URL}/ability/search?${params}`);
    console.log(response)
    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error ?? `Request failed with status ${response.status}`);
    }

    return response.json();
}
