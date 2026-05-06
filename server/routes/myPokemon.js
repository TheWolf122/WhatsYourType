import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/my-pokemon/:sessionId?decision=smash|snuggle
router.get('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { decision } = req.query;

  let rows;
  if (decision) {
    rows = db.prepare(`
      SELECT p.*, v.decision FROM votes v
      JOIN pokemon p ON v.pokemon_id = p.id
      WHERE v.session_id = ? AND v.decision = ?
      ORDER BY v.voted_at ASC
    `).all(sessionId, decision);
  } else {
    rows = db.prepare(`
      SELECT p.*, v.decision FROM votes v
      JOIN pokemon p ON v.pokemon_id = p.id
      WHERE v.session_id = ? AND v.decision IN ('smash', 'snuggle')
      ORDER BY v.voted_at ASC
    `).all(sessionId);
  }

  res.json(rows);
});

export default router;
