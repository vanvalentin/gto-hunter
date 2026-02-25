import { Router, Request, Response } from 'express';
import { getDB } from '../db/schema.js';
import { authMiddleware } from './middleware.js';

const router = Router();

router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const db = getDB();
  const userId = (req as any).userId;
  const user = db.prepare(`
    SELECT u.id, u.username, u.email, u.gold, u.gems,
           s.xp, s.level, s.xp_to_next, s.elo, s.wins, s.losses, s.streak, s.equipped_skin_id
    FROM users u
    JOIN player_stats s ON s.user_id = u.id
    WHERE u.id = ?
  `).get(userId) as any;

  if (!user) return res.status(404).json({ error: 'User not found' });

  const inventory = db.prepare('SELECT skin_id FROM inventory WHERE user_id = ?').all(userId) as any[];
  res.json({ ...user, inventory: inventory.map((i) => i.skin_id) });
});

router.post('/me/equip-skin', authMiddleware, (req: Request, res: Response) => {
  const { skinId } = req.body;
  const userId = (req as any).userId;
  const db = getDB();

  const owned = db.prepare('SELECT 1 FROM inventory WHERE user_id = ? AND skin_id = ?').get(userId, skinId);
  if (!owned) return res.status(403).json({ error: 'Skin not owned' });

  db.prepare('UPDATE player_stats SET equipped_skin_id = ? WHERE user_id = ?').run(skinId, userId);
  res.json({ success: true });
});

router.get('/leaderboard', (req: Request, res: Response) => {
  const db = getDB();
  const rows = db.prepare(`
    SELECT u.username, s.elo, s.wins, s.losses
    FROM users u JOIN player_stats s ON s.user_id = u.id
    ORDER BY s.elo DESC LIMIT 50
  `).all();
  res.json(rows);
});

export default router;
