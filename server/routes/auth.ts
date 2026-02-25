import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { getDB } from '../db/schema.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'gto-hunter-dev-secret';

router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const db = getDB();
  const exists = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (exists) return res.status(409).json({ error: 'Username or email already taken' });

  const password_hash = await bcrypt.hash(password, 12);
  const id = randomUUID();

  db.prepare('INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)').run(id, username, email, password_hash);
  db.prepare('INSERT INTO player_stats (user_id) VALUES (?)').run(id);
  db.prepare('INSERT INTO inventory (user_id, skin_id) VALUES (?, ?)').run(id, 'classic');

  const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, userId: id, username });
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, userId: user.id, username: user.username });
});

export default router;
