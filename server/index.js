import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import './db.js';
import pokemonRouter from './routes/pokemon.js';
import votesRouter from './routes/votes.js';
import resultsRouter from './routes/results.js';
import myPokemonRouter from './routes/myPokemon.js';
import leaderboardRouter from './routes/leaderboard.js';
import statsRouter from './routes/stats.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/pokemon', pokemonRouter);
app.use('/api/votes', votesRouter);
app.use('/api/results', resultsRouter);
app.use('/api/my-pokemon', myPokemonRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/stats', statsRouter);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
