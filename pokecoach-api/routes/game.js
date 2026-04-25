import { Router } from 'express';
import supabase from '../db/supabase.js';

const router = Router();

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 1025;

// GET /game
router.get('/', async (req, res) => {

    const { data, error } = await supabase
        .from('game')
        .select()

    if (error) return res.status(500).json({ error });
    res.json(data);
});

// GET /game/search?name=pokemon champions
router.get('/search', async (req, res) => {
    const gameNameQuery = req.query.name;

    if (typeof gameNameQuery !== 'string' || !gameNameQuery.trim()) {
        return res.status(400).json({ error: 'Invalid name query parameter' });
    }

    const { data, error } = await supabase
        .from('game')
        .select()
        .ilike('name', `%${gameNameQuery.trim()}%`);

    if (error) return res.status(500).json({ error });
    res.json(data);
});

// GET /game/:id
router.get('/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('game')
        .select()
        .eq('id', req.params.id)
        .single();

    if (error) return res.status(404).json({ error });
    res.json(data);
});

export default router;
