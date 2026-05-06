import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/stats
router.get('/', (req, res) => {
  const row = db.prepare(
    `SELECT COUNT(*) AS total FROM votes WHERE decision IN ('smash', 'snuggle', 'pass')`
  ).get();
  res.json({ totalVotes: row.total });
});

export default router;
