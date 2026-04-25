import type { ApiError, PokemonType } from "./pokemon-api";
import { API_BASE_URL } from './config';

export enum MoveCategory {
    Physical = "Physical",
    Special = "Special",
    Status = "Status",
}

export interface Move {
    id: number;
    name: string;
    type: PokemonType;
    base_power: number;
    category: MoveCategory;
}

export async function searchMoves(query: string): Promise<Move[]> {
    const params = new URLSearchParams({ pokemonName: query });
    const response = await fetch(`${API_BASE_URL}/move/search?${params}`);

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error ?? `Request failed with status ${response.status}`);
    }

    return response.json();
}
