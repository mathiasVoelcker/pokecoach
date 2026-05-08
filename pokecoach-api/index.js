import 'dotenv/config';
import pokemonRoutes from './routes/pokemon.js';
import abilityRoutes from './routes/ability.js';
import moveRoutes from './routes/move.js'; 
import pokecoachRoutes from './routes/pokecoach.js'; 
import gameRoutes from './routes/game.js';
import express from 'express';
import cors from 'cors';
import { Router } from 'express';
import { main } from './agents/geminiAgent.js';

const app = express();
const port = 8080;

const router = Router();

const ALLOWED_ORIGIN = [process.env.LOCAL_ORIGIN, process.env.VERCEL_ORIGIN].filter(Boolean);

app.use(cors({
  origin: ALLOWED_ORIGIN,
}));
app.use(express.json());
app.use('/pokemon', pokemonRoutes);
app.use('/game', gameRoutes);
app.use('/ability', abilityRoutes);
app.use('/move', moveRoutes);
app.use('/pokecoach', pokecoachRoutes);
app.use('/test', router.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint' });
    main();
  }));

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
