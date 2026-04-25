import pokemonRoutes from './routes/pokemon.js';
import abilityRoutes from './routes/ability.js';
import moveRoutes from './routes/move.js'; 
import pokecoachRoutes from './routes/pokecoach.js'; 
import gameRoutes from './routes/game.js';
import express from 'express';
// import 'dotenv/config';
import dotenv from 'dotenv';
import cors from 'cors';



dotenv.config();

const app = express();
const port = 8080;

console.log(process.env.ALLOWED_ORIGIN)
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN,
}));
app.use(express.json());
app.use('/pokemon', pokemonRoutes);
app.use('/game', gameRoutes);
app.use('/ability', abilityRoutes);
app.use('/move', moveRoutes);
app.use('/pokecoach', pokecoachRoutes);

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
