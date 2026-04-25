import type { ApiError } from "./pokemon-api";
import { API_BASE_URL } from "./config";

export interface Game {
    id: number;
    name: string;
}

export async function getGames(): Promise<Game[]> {
    const response = await fetch(`${API_BASE_URL}/game`);

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error ?? `Request failed with status ${response.status}`);
    }

    return response.json();
}
