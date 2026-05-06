import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/results/:sessionId
router.get('/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  // Step 1 — top type per decision
  const typeRows = db.prepare(`
    SELECT v.decision, p.type_1 AS type, COUNT(*) AS count
    FROM votes v
    JOIN pokemon p ON v.pokemon_id = p.id
    WHERE v.session_id = ? AND v.decision IN ('smash', 'snuggle')
    GROUP BY v.decision, p.type_1
    ORDER BY count DESC
  `).all(sessionId);

  const topType = {};
  for (const row of typeRows) {
    if (!topType[row.decision]) topType[row.decision] = row.type;
  }

  // Step 2 — top generation per decision
  const genRows = db.prepare(`
    SELECT v.decision, p.generation, COUNT(*) AS count
    FROM votes v
    JOIN pokemon p ON v.pokemon_id = p.id
    WHERE v.session_id = ? AND v.decision IN ('smash', 'snuggle')
    GROUP BY v.decision, p.generation
    ORDER BY count DESC
  `).all(sessionId);

  const topGeneration = {};
  for (const row of genRows) {
    if (!topGeneration[row.decision]) topGeneration[row.decision] = row.generation;
  }

  // Step 3 — legendary rate per decision
  const legendaryRows = db.prepare(`
    SELECT v.decision,
      SUM(CASE WHEN p.is_legendary = 1 OR p.is_mythical = 1 THEN 1 ELSE 0 END) AS legendary_count,
      COUNT(*) AS total
    FROM votes v
    JOIN pokemon p ON v.pokemon_id = p.id
    WHERE v.session_id = ? AND v.decision IN ('smash', 'snuggle')
    GROUP BY v.decision
  `).all(sessionId);

  const legendaryRate = {};
  for (const row of legendaryRows) {
    legendaryRate[row.decision] = row.total > 0 ? row.legendary_count / row.total : 0;
  }

  // Step 4 — vote counts per decision + overall favorite type
  const countRows = db.prepare(`
    SELECT v.decision, COUNT(*) AS total
    FROM votes v
    WHERE v.session_id = ? AND v.decision IN ('smash', 'snuggle')
    GROUP BY v.decision
  `).all(sessionId);

  const voteCount = {};
  for (const row of countRows) {
    voteCount[row.decision] = row.total;
  }

  const overallTypeRow = db.prepare(`
    SELECT p.type_1 AS type, COUNT(*) AS count
    FROM votes v
    JOIN pokemon p ON v.pokemon_id = p.id
    WHERE v.session_id = ? AND v.decision IN ('smash', 'snuggle')
    GROUP BY p.type_1
    ORDER BY count DESC
    LIMIT 1
  `).get(sessionId);

  const buildProfile = decision => {
    if (!topType[decision] && !topGeneration[decision]) return null;
    return {
      topType: topType[decision] ?? null,
      topGeneration: topGeneration[decision] ?? null,
      legendaryRate: legendaryRate[decision] ?? 0,
      count: voteCount[decision] ?? 0,
    };
  };

  res.json({
    smashProfile: buildProfile('smash'),
    snuggleProfile: buildProfile('snuggle'),
    smashCount: voteCount['smash'] ?? 0,
    snuggleCount: voteCount['snuggle'] ?? 0,
    favoriteType: overallTypeRow?.type ?? null,
  });
});

export default router;
