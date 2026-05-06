import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/pokemon/session — shuffled list of all pokemon IDs
router.get('/session', (req, res) => {
  const rows = db.prepare('SELECT id FROM pokemon ORDER BY id').all();
  const ids = rows.map(r => r.id);

  res.json({ pokemon: ids });
});

// GET /api/pokemon/:id — single pokemon row
router.get('/:id', (req, res) => {
  const pokemon = db.prepare('SELECT * FROM pokemon WHERE id = ?').get(req.params.id);
  if (!pokemon) return res.status(404).json({ error: 'Not found' });
  res.json(pokemon);
});

export default router;
