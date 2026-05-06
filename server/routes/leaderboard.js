import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/leaderboard?type=fire&generation=1
router.get('/', (req, res) => {
  const { type, generation } = req.query;

  let where = `WHERE v.decision IN ('smash', 'snuggle', 'pass')`;
  const params = [];

  if (type) {
    where += ` AND (p.type_1 = ? OR p.type_2 = ?)`;
    params.push(type, type);
  }
  if (generation) {
    where += ` AND p.generation = ?`;
    params.push(parseInt(generation));
  }

  const rows = db.prepare(`
    SELECT p.id, p.name, p.sprite_url, p.type_1, p.type_2,
           v.decision, COUNT(*) AS vote_count
    FROM votes v
    JOIN pokemon p ON v.pokemon_id = p.id
    ${where}
    GROUP BY p.id, v.decision
    ORDER BY vote_count DESC
  `).all(...params);

  const smash = rows.filter(r => r.decision === 'smash').slice(0, 10);
  const snuggle = rows.filter(r => r.decision === 'snuggle').slice(0, 10);
  const pass = rows.filter(r => r.decision === 'pass').slice(0, 10);

  res.json({ smash, snuggle, pass });
});

export default router;
