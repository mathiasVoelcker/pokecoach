import { Router } from 'express';
import { getMovesByPokemonName } from '../repositories/moveService.js';

const router = Router();

router.get('/search', async (req, res) => {
    const pokemonNameQuery = req.query.pokemonName;
    try {
        const data = await getMovesByPokemonName(pokemonNameQuery);
        res.json(data);
    } catch (error) {
        return res.status(500).json({ error });
    }
});

export default router;
