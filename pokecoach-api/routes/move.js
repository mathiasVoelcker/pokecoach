import { Router } from 'express';
import supabase from '../db/supabase.js';

const router = Router();

router.get('/search', async (req, res) => {
    const pokemonNameQuery = req.query.pokemonName;
    const { data, error } = await supabase
        .from('pokemon')
        .select(`pokemon_moves (
            move (
                name,
                base_power,
                category,
                type (
                    name,
                    color
                )
            )
        )`)
        .eq('name', pokemonNameQuery)

    if (error) return res.status(500).json({ error });
    res.json(data.map(p => p.pokemon_moves).flat().map(pm => pm.move));
});

export default router;