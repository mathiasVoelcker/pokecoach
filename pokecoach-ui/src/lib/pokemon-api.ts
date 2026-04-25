import { API_BASE_URL } from './config';

export interface PokemonType {
    id: number;
    name: string;
    color: string;
}

export interface Pokemon {
    id: number;
    name: string;
    first_type: PokemonType;
    second_type: PokemonType | null;
    base_hp: number;
    base_attack: number;
    base_defense: number;
    base_special_attack: number;
    base_special_defense: number;
    base_speed: number;
}

export interface ApiError {
    error: string;
}

export async function searchPokemon(pokemonName: string, gameName?: string): Promise<Pokemon[]> {
    const params = new URLSearchParams();

    if (pokemonName.trim()) {
        params.set('name', pokemonName);
    }

    if (gameName?.trim()) {
        params.set('game_name', gameName);
    }

    const response = await fetch(`${API_BASE_URL}/pokemon/search?${params}`);

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error ?? `Request failed with status ${response.status}`);
    }

    return response.json();
}

export function getArtwork(pokemon: Pokemon): string {
    // const response = await fetch(`${API_BASE_URL}/pokemon/${pokemon.id}/artwork`);

    // if (!response.ok) {
    //     const error: ApiError = await response.json();
    //     throw new Error(error.error ?? `Request failed with status ${response.status}`);
    // }
    
    // const data = await response.json();

    
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
}
