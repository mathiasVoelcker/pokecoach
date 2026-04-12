import pokemonRoutes from './routes/pokemon.js';
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

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});