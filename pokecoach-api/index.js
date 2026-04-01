import pokemonRoutes from './routes/pokemon.js';
import express from 'express';
import dotenv from 'dotenv';


dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use('/pokemon', pokemonRoutes);

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});