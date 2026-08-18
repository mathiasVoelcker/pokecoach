import { Router } from 'express';
import supabase from '../db/supabase.js';

const router = Router();

// GET /item/search?name=leftovers
router.get('/search', async (req, res) => {
    const itemNameQuery = req.query.name;

    if (typeof itemNameQuery !== 'string' || !itemNameQuery.trim()) {
        return res.status(400).json({ error: 'Invalid name query parameter' });
    }

    const { data, error } = await supabase
        .from('item')
        .select('id, name, description')
        .ilike('name', `%${itemNameQuery.trim()}%`)
        .order('name');

    if (error) return res.status(500).json({ error });
    res.json(data);
});

export default router;
