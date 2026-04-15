import { Router } from 'express';
import supabase from '../db/supabase.js';

const router = Router();

router.get('/search', async (req, res) => {
    const pokemonNameQuery = req.query.pokemonName;
    const { data, error } = await supabase
        .from('pokemon')
        .select('pokemon_abilities (ability (name))')
        .eq('name', pokemonNameQuery)

    if (error) return res.status(500).json({ error });
    res.json(data.map(p => p.pokemon_abilities).flat().map(pa => pa.ability));
});

export default router;