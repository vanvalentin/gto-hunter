import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import skinsRouter from './routes/skins.js';
import campaignRouter from './routes/campaign.js';
import { setupMatchmaking } from './socket/matchmaking.js';

config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.APP_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/skins', skinsRouter);
app.use('/api/campaign', campaignRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve built frontend in production
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

setupMatchmaking(io);

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const PORT = process.env.PORT ?? 4000;
httpServer.listen(PORT, () => {
  console.log(`[GTO Hunter] Server running on port ${PORT}`);
});
