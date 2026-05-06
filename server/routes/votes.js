import { Router } from 'express';
import db from '../db.js';

const router = Router();

const VALID_DECISIONS = ['smash', 'snuggle', 'pass', 'skip'];

// POST /api/votes
router.post('/', (req, res) => {
  const { sessionId, pokemonId, decision } = req.body;

  if (!sessionId || !pokemonId) {
    return res.status(400).json({ error: 'sessionId and pokemonId are required' });
  }
  if (!VALID_DECISIONS.includes(decision)) {
    return res.status(400).json({ error: `decision must be one of: ${VALID_DECISIONS.join(', ')}` });
  }

  db.prepare(
    `INSERT OR IGNORE INTO sessions (id, created_at, last_active_at) VALUES (?, datetime('now'), datetime('now'))`
  ).run(sessionId);

  db.prepare(
    `UPDATE sessions SET last_active_at = datetime('now') WHERE id = ?`
  ).run(sessionId);

  db.prepare(
    `INSERT INTO votes (session_id, pokemon_id, decision, voted_at) VALUES (?, ?, ?, datetime('now'))`
  ).run(sessionId, pokemonId, decision);

  res.json({ ok: true });
});

export default router;
