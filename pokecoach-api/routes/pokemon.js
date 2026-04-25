import { Router } from 'express';
import supabase from '../db/supabase.js';
import { searchPokemons } from '../repositories/pokemonServices.js';

const router = Router();

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 1025;

// GET /pokemon?page=1&limit=100
router.get('/', async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, parseInt(req.query.limit) || DEFAULT_PAGE_SIZE);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
        .from('pokemon')
        .select(`
            name,
            base_hp,
            base_attack,
            base_defense,
            base_special_attack,
            base_special_defense,
            base_speed,
            first_type (
                name, color
            ),
            second_type (
                name, color
            )
        `).range(from, to);


    if (error) return res.status(500).json({ error });
    res.json(data);
});

router.get('/search', async (req, res) => {
    const pokemonNameQuery = req.query.name;
    const pokemonGameNameQuery = req.query.game_name || '';
    if (typeof pokemonNameQuery !== 'string' || !pokemonNameQuery.trim()) {
        return res.status(400).json({ error: 'Invalid name query parameter' });
    }

    try {
        const data = await searchPokemons({
            name: pokemonNameQuery,
            gameName: pokemonGameNameQuery,
        });

        res.json(data);
    } catch (error) {
        return res.status(500).json({ error });
    }
});

// GET /pokemon/:id
router.get('/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('pokemon')
        .select()
        .eq('id', req.params.id)
        .single();
    if (error) return res.status(404).json({ error });
    res.json(data);
});

// GET /pokemon/:id/move
router.get('/:id/move', async (req, res) => {
    const pokemonId = req.params.id;
    const { data, error } = await supabase
        .from('pokemon_moves')
        .select('move (name, type (name, color), base_power)')
        .eq('pokemon_id', pokemonId)
    if (error) return res.status(500).json({ error });
    res.json(data);
});

// GET /pokemon/:id/ability
router.get('/:id/ability', async (req, res) => {
    const pokemonId = req.params.id;
    const { data, error } = await supabase
        .from('pokemon_abilities')
        .select('ability (name)')
        .eq('pokemon_id', pokemonId)
    if (error) return res.status(500).json({ error });
    res.json(data);
});

export default router;
