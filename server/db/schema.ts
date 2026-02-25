import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'gto-hunter.db');

let db: Database.Database;

export function getDB(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      username    TEXT UNIQUE NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      gold        INTEGER NOT NULL DEFAULT 500,
      gems        INTEGER NOT NULL DEFAULT 10,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS player_stats (
      user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      xp          INTEGER NOT NULL DEFAULT 0,
      level       INTEGER NOT NULL DEFAULT 1,
      xp_to_next  INTEGER NOT NULL DEFAULT 1000,
      elo         INTEGER NOT NULL DEFAULT 1200,
      wins        INTEGER NOT NULL DEFAULT 0,
      losses      INTEGER NOT NULL DEFAULT 0,
      streak      INTEGER NOT NULL DEFAULT 0,
      equipped_skin_id TEXT NOT NULL DEFAULT 'classic'
    );

    CREATE TABLE IF NOT EXISTS card_skins (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      rarity      TEXT NOT NULL CHECK(rarity IN ('common','rare','epic','legendary')),
      price_gold  INTEGER NOT NULL DEFAULT 0,
      price_gems  INTEGER NOT NULL DEFAULT 0,
      back_color  TEXT NOT NULL,
      border_color TEXT NOT NULL,
      glow_color  TEXT NOT NULL,
      pattern     TEXT NOT NULL DEFAULT 'classic'
    );

    CREATE TABLE IF NOT EXISTS inventory (
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      skin_id     TEXT NOT NULL REFERENCES card_skins(id),
      acquired_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, skin_id)
    );

    CREATE TABLE IF NOT EXISTS campaign_progress (
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      region_id   TEXT NOT NULL,
      stage_id    INTEGER NOT NULL,
      completed   INTEGER NOT NULL DEFAULT 0,
      stars       INTEGER NOT NULL DEFAULT 0,
      best_score  REAL NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, region_id, stage_id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id          TEXT PRIMARY KEY,
      player1_id  TEXT NOT NULL REFERENCES users(id),
      player2_id  TEXT NOT NULL REFERENCES users(id),
      winner_id   TEXT REFERENCES users(id),
      elo_delta   INTEGER NOT NULL DEFAULT 0,
      player1_ev  REAL,
      player2_ev  REAL,
      played_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedSkins(db);
}

function seedSkins(db: Database.Database) {
  const existing = db.prepare('SELECT COUNT(*) as count FROM card_skins').get() as { count: number };
  if (existing.count > 0) return;

  const skins = [
    { id: 'classic', name: 'Classic', rarity: 'common', price_gold: 0, price_gems: 0, back_color: '#1a1a2e', border_color: '#C9A84C', glow_color: '#C9A84C', pattern: 'classic' },
    { id: 'shadow', name: 'Shadow Veil', rarity: 'rare', price_gold: 500, price_gems: 0, back_color: '#0a0a0a', border_color: '#6B21A8', glow_color: '#9333EA', pattern: 'shadow' },
    { id: 'frost', name: 'Arctic Frost', rarity: 'rare', price_gold: 500, price_gems: 0, back_color: '#0c1445', border_color: '#22D3EE', glow_color: '#06B6D4', pattern: 'frost' },
    { id: 'flames', name: 'Inferno', rarity: 'epic', price_gold: 1200, price_gems: 0, back_color: '#1a0505', border_color: '#F97316', glow_color: '#EF4444', pattern: 'flames' },
    { id: 'neon', name: 'Neon Pulse', rarity: 'epic', price_gold: 0, price_gems: 80, back_color: '#050520', border_color: '#A855F7', glow_color: '#EC4899', pattern: 'neon' },
    { id: 'galaxy', name: 'Void Galaxy', rarity: 'legendary', price_gold: 0, price_gems: 200, back_color: '#02010a', border_color: '#C9A84C', glow_color: '#8B5CF6', pattern: 'galaxy' },
    { id: 'royal', name: 'Royal Crest', rarity: 'legendary', price_gold: 3000, price_gems: 0, back_color: '#0d0a00', border_color: '#FBBF24', glow_color: '#F59E0B', pattern: 'royal' },
    { id: 'gold', name: 'Pure Gold', rarity: 'legendary', price_gold: 0, price_gems: 350, back_color: '#1a1200', border_color: '#FBBF24', glow_color: '#FBBF24', pattern: 'gold' },
  ];

  const insert = db.prepare(`
    INSERT OR IGNORE INTO card_skins (id, name, rarity, price_gold, price_gems, back_color, border_color, glow_color, pattern)
    VALUES (@id, @name, @rarity, @price_gold, @price_gems, @back_color, @border_color, @glow_color, @pattern)
  `);

  for (const skin of skins) insert.run(skin);
}
