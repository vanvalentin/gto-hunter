import { Router, Request, Response } from 'express';
import { getDB } from '../db/schema.js';
import { authMiddleware } from './middleware.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const db = getDB();
  const skins = db.prepare('SELECT * FROM card_skins ORDER BY rarity').all();
  res.json(skins);
});

router.post('/buy', authMiddleware, (req: Request, res: Response) => {
  const { skinId } = req.body;
  const userId = (req as any).userId;
  const db = getDB();

  const skin = db.prepare('SELECT * FROM card_skins WHERE id = ?').get(skinId) as any;
  if (!skin) return res.status(404).json({ error: 'Skin not found' });

  const alreadyOwned = db.prepare('SELECT 1 FROM inventory WHERE user_id = ? AND skin_id = ?').get(userId, skinId);
  if (alreadyOwned) return res.status(409).json({ error: 'Already owned' });

  const user = db.prepare('SELECT gold, gems FROM users WHERE id = ?').get(userId) as any;

  if (skin.price_gems > 0) {
    if (user.gems < skin.price_gems) return res.status(402).json({ error: 'Not enough Gems' });
    db.prepare('UPDATE users SET gems = gems - ? WHERE id = ?').run(skin.price_gems, userId);
  } else if (skin.price_gold > 0) {
    if (user.gold < skin.price_gold) return res.status(402).json({ error: 'Not enough Gold' });
    db.prepare('UPDATE users SET gold = gold - ? WHERE id = ?').run(skin.price_gold, userId);
  }

  db.prepare('INSERT INTO inventory (user_id, skin_id) VALUES (?, ?)').run(userId, skinId);
  res.json({ success: true });
});

export default router;
