import { Router, Request, Response } from 'express';
import { getDB } from '../db/schema.js';
import { authMiddleware } from './middleware.js';

const router = Router();

router.get('/progress', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const db = getDB();
  const progress = db.prepare('SELECT * FROM campaign_progress WHERE user_id = ?').all(userId);
  res.json(progress);
});

router.post('/complete', authMiddleware, (req: Request, res: Response) => {
  const { regionId, stageId, stars, score } = req.body;
  const userId = (req as any).userId;
  const db = getDB();

  const existing = db.prepare('SELECT * FROM campaign_progress WHERE user_id = ? AND region_id = ? AND stage_id = ?').get(userId, regionId, stageId) as any;

  if (existing) {
    if (stars > existing.stars || score > existing.best_score) {
      db.prepare(`
        UPDATE campaign_progress SET completed = 1, stars = ?, best_score = ? 
        WHERE user_id = ? AND region_id = ? AND stage_id = ?
      `).run(Math.max(stars, existing.stars), Math.max(score, existing.best_score), userId, regionId, stageId);
    }
  } else {
    db.prepare(`
      INSERT INTO campaign_progress (user_id, region_id, stage_id, completed, stars, best_score)
      VALUES (?, ?, ?, 1, ?, ?)
    `).run(userId, regionId, stageId, stars, score);
  }

  const goldReward = stars * 25;
  const xpReward = stars * 50;
  db.prepare('UPDATE users SET gold = gold + ? WHERE id = ?').run(goldReward, userId);
  db.prepare('UPDATE player_stats SET xp = xp + ? WHERE user_id = ?').run(xpReward, userId);

  res.json({ success: true, goldReward, xpReward });
});

export default router;
