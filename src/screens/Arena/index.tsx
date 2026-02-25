import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users } from 'lucide-react';
import { TopBar } from '../../components/ui/TopBar';
import { usePlayerStore } from '../../store/playerStore';
import type { ArenaMode, ArenaMember } from '../../types';
import { ModeSelect } from './ModeSelect';
import { Duel1v1 } from './Duel1v1';
import { PokerTable } from './PokerTable';

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_OPPONENTS: ArenaMember[] = [
  { name: 'PokerWolf99', elo: 1340, avatar: 'https://picsum.photos/seed/wolf/100/100',      skinId: 'shadow'  },
  { name: 'GTO_God',     elo: 1650, avatar: 'https://picsum.photos/seed/god/100/100',       skinId: 'galaxy'  },
  { name: 'AllInAnna',   elo: 1120, avatar: 'https://picsum.photos/seed/anna/100/100',      skinId: 'frost'   },
  { name: 'TiltKing',    elo: 1250, avatar: 'https://picsum.photos/seed/tilt/100/100',      skinId: 'shadow'  },
  { name: 'BetBuster',   elo: 1550, avatar: 'https://picsum.photos/seed/betbust/100/100',   skinId: 'galaxy'  },
];

const TOP_PLAYERS = [
  { rank: 1, name: 'GTO_God',     elo: 2100, trophy: '🏆' },
  { rank: 2, name: 'PokerPrince', elo: 1980, trophy: '🥇' },
  { rank: 3, name: 'AllInAnna',   elo: 1840, trophy: '🥈' },
];

const MODE_LABELS: Record<ArenaMode, string> = {
  duel:    'Duel',
  poker3:  '3-Player',
  poker5:  '5-Player',
};

const MODE_CONFIG: Record<ArenaMode, { goldWin: number; xpWin: number; goldLoss: number; xpLoss: number }> = {
  duel:   { goldWin: 75,  xpWin: 150, goldLoss: 20, xpLoss: 50  },
  poker3: { goldWin: 120, xpWin: 220, goldLoss: 30, xpLoss: 60  },
  poker5: { goldWin: 200, xpWin: 350, goldLoss: 40, xpLoss: 80  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

type ArenaState = 'lobby' | 'mode_select' | 'searching' | 'matched' | 'playing';

// ── Icon ──────────────────────────────────────────────────────────────────────

function SwordsIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
      <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
      <line x1="5"  y1="14" x2="9"  y2="18" />
      <line x1="7"  y1="11" x2="11" y2="15" />
      <line x1="3"  y1="21" x2="5"  y2="19" />
    </svg>
  );
}

// ── ELO pill ──────────────────────────────────────────────────────────────────

function EloPill({ label, elo, accent }: { label: string; elo: number; accent: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 rounded"
      style={{ background: 'rgba(0,0,0,0.4)', border: `2px solid ${accent}22`, flex: 1 }}>
      <span className="font-pixel text-[8px] uppercase tracking-widest mb-0.5"
        style={{ color: 'rgba(255,245,214,0.35)' }}>{label}</span>
      <span className="font-pixel text-lg leading-none" style={{ color: accent }}>{elo}</span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function ArenaScreen() {
  const [state,        setState]        = useState<ArenaState>('lobby');
  const [selectedMode, setSelectedMode] = useState<ArenaMode>('duel');
  const [searchTimer,  setSearchTimer]  = useState(0);
  const [opponent,     setOpponent]     = useState<ArenaMember>(MOCK_OPPONENTS[0]);
  const [recentMatches, setRecentMatches] = useState<
    Array<{ opponent: string; result: 'win' | 'loss'; eloDelta: number; mode: string }>
  >([
    { opponent: 'PokerWolf99', result: 'win',  eloDelta: +24, mode: 'Duel'     },
    { opponent: 'GTO_God',     result: 'loss', eloDelta: -18, mode: '3-Player' },
    { opponent: 'AllInAnna',   result: 'win',  eloDelta: +20, mode: '5-Player' },
  ]);

  const { player, equippedSkin, equippedChipSkin, addGold, addXP, recordWin, recordLoss, updateElo } = usePlayerStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSearch = (mode: ArenaMode) => {
    setSelectedMode(mode);
    setState('searching');
    setSearchTimer(0);

    timerRef.current = setInterval(() => {
      setSearchTimer((t) => {
        if (t >= 3) {
          clearInterval(timerRef.current!);
          const opp = MOCK_OPPONENTS[Math.floor(Math.random() * MOCK_OPPONENTS.length)];
          setOpponent(opp);
          setState(mode === 'duel' ? 'matched' : 'playing');
          return t;
        }
        return t + 1;
      });
    }, 1000);
  };

  const handleDuelFinish = (won: boolean) => {
    const cfg = MODE_CONFIG.duel;
    if (won) {
      recordWin('duel');
      addGold(cfg.goldWin);
      addXP(cfg.xpWin);
      setRecentMatches((prev) => [
        { opponent: opponent.name, result: 'win', eloDelta: 25, mode: 'Duel' },
        ...prev.slice(0, 4),
      ]);
    } else {
      recordLoss('duel');
      addGold(cfg.goldLoss);
      addXP(cfg.xpLoss);
      setRecentMatches((prev) => [
        { opponent: opponent.name, result: 'loss', eloDelta: -20, mode: 'Duel' },
        ...prev.slice(0, 4),
      ]);
    }
    setState('lobby');
  };

  const handlePokerFinish = (placement: number, eloDelta: number) => {
    const cfg = MODE_CONFIG[selectedMode];
    const won = placement === 1;
    const modeLabel = selectedMode === 'poker3' ? '3-Player' : '5-Player';

    updateElo(selectedMode, eloDelta);

    if (won) {
      recordWin(selectedMode);
      addGold(cfg.goldWin);
      addXP(cfg.xpWin);
    } else {
      recordLoss(selectedMode);
      addGold(placement <= 2 ? cfg.goldWin : cfg.goldLoss);
      addXP(placement <= 2 ? cfg.xpWin : cfg.xpLoss);
    }

    setRecentMatches((prev) => [
      {
        opponent: `${modeLabel} table`,
        result: won ? 'win' : 'loss',
        eloDelta,
        mode: modeLabel,
      },
      ...prev.slice(0, 4),
    ]);
    setState('lobby');
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return (
    <div className="min-h-screen flex flex-col felt-dark-bg">
      <TopBar title="Arena" showBack showCurrency />

      <AnimatePresence mode="wait">

        {/* ── LOBBY ── */}
        {state === 'lobby' && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto pb-6 px-4 pt-4">

            {/* Per-mode ELO ratings */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="balatro-panel p-4 mb-4">
              <p className="font-pixel text-[9px] uppercase tracking-widest mb-3"
                style={{ color: 'rgba(255,245,214,0.4)' }}>
                Your Ratings
              </p>
              <div className="flex gap-2 mb-4">
                <EloPill label="Duel"     elo={player.eloDuel ?? player.elo}    accent="#ffb700" />
                <EloPill label="3-Player" elo={player.eloPoker3 ?? player.elo}  accent="#4a90e2" />
                <EloPill label="5-Player" elo={player.eloPoker5 ?? player.elo}  accent="#a855f7" />
              </div>

              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ x: 2, y: 2, boxShadow: 'none' }}
                onClick={() => setState('mode_select')}
                className="btn-balatro btn-gold w-full py-4 flex items-center justify-center gap-3 cursor-pointer text-lg"
              >
                <SwordsIcon className="w-5 h-5" />
                Enter Arena
              </motion.button>
            </motion.div>

            {/* Recent matches */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="balatro-panel mb-4 overflow-hidden">
              <p className="font-pixel text-[9px] uppercase tracking-widest px-4 pt-3 pb-2"
                style={{ color: 'rgba(255,245,214,0.4)' }}>
                Recent Matches
              </p>
              {recentMatches.slice(0, 3).map((m, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5"
                  style={{ borderTop: i > 0 ? '2px solid rgba(0,0,0,0.4)' : 'none' }}>
                  <div className="w-7 h-7 flex items-center justify-center font-pixel text-xs shrink-0"
                    style={{
                      background: m.result === 'win' ? '#3a8a4a' : '#cc2936',
                      border: `2px solid ${m.result === 'win' ? '#1d5c2a' : '#8a1920'}`,
                      boxShadow: `2px 2px 0 ${m.result === 'win' ? '#1d5c2a' : '#8a1920'}`,
                      borderRadius: 6,
                      color: 'white',
                    }}>
                    {m.result === 'win' ? 'W' : 'L'}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-pixel text-xs" style={{ color: '#fff5d6' }}>vs {m.opponent}</span>
                    <span className="font-pixel text-[8px] uppercase tracking-widest"
                      style={{ color: 'rgba(255,245,214,0.3)' }}>{m.mode}</span>
                  </div>
                  <span className="font-pixel text-xs" style={{ color: m.eloDelta > 0 ? '#3a8a4a' : '#e63946' }}>
                    {m.eloDelta > 0 ? '+' : ''}{m.eloDelta} ELO
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Top players */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
              className="balatro-panel overflow-hidden">
              <p className="font-pixel text-[9px] uppercase tracking-widest px-4 pt-3 pb-2"
                style={{ color: 'rgba(255,245,214,0.4)' }}>
                Top Players
              </p>
              {TOP_PLAYERS.map((p, i) => (
                <div key={p.rank} className="flex items-center gap-3 px-4 py-2.5"
                  style={{ borderTop: i > 0 ? '2px solid rgba(0,0,0,0.4)' : 'none' }}>
                  <span className="text-lg leading-none">{p.trophy}</span>
                  <span className="font-pixel text-xs flex-1" style={{ color: '#fff5d6' }}>{p.name}</span>
                  <span className="font-pixel text-sm" style={{ color: '#ffb700' }}>{p.elo}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* ── MODE SELECT ── */}
        {state === 'mode_select' && (
          <motion.div key="mode_select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden">
            <ModeSelect
              eloDuel={player.eloDuel ?? player.elo}
              eloPoker3={player.eloPoker3 ?? player.elo}
              eloPoker5={player.eloPoker5 ?? player.elo}
              onSelect={(mode) => startSearch(mode)}
              onBack={() => setState('lobby')}
            />
          </motion.div>
        )}

        {/* ── SEARCHING ── */}
        {state === 'searching' && (
          <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full animate-spin"
                style={{ border: '4px solid rgba(255,183,0,0.2)', borderTopColor: '#ffb700' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Users className="w-8 h-8" style={{ color: '#ffb700' }} />
              </div>
            </div>
            <div className="text-center">
              <p className="font-pixel text-xl" style={{ color: '#fff5d6' }}>
                {selectedMode === 'duel' ? 'Finding Opponent' : 'Filling Table'}
              </p>
              <p className="font-pixel text-xs mt-1 uppercase tracking-widest" style={{ color: '#ffb700' }}>
                {MODE_LABELS[selectedMode]}
              </p>
              <p className="font-pixel text-xs mt-2" style={{ color: 'rgba(255,245,214,0.4)' }}>
                Searching for players near your rating...
              </p>
            </div>
            <button onClick={() => setState('lobby')} className="btn-balatro btn-red px-8 py-2.5 cursor-pointer">
              Cancel
            </button>
          </motion.div>
        )}

        {/* ── MATCHED (1v1 Duel only) ── */}
        {state === 'matched' && (
          <motion.div key="matched" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-4 gap-8">

            <div className="flex flex-col items-center gap-6">
              <span className="font-pixel text-xs uppercase tracking-widest px-3 py-1"
                style={{ background: '#0f2a18', border: '2px solid #1d5c2a', boxShadow: '2px 2px 0 #0a1a0f', borderRadius: 6, color: '#3a8a4a' }}>
                Match Found — Duel
              </span>

              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <img src={player.avatar} alt="You" className="w-16 h-16 object-cover"
                    style={{ border: '3px solid #4a90e2', boxShadow: '4px 4px 0 #1a4d8a', borderRadius: 8 }} />
                  <p className="font-pixel text-sm" style={{ color: '#fff5d6' }}>{player.username}</p>
                  <p className="font-pixel text-[10px]" style={{ color: '#ffb700' }}>{player.eloDuel ?? player.elo} ELO</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="font-pixel text-2xl" style={{ color: '#e63946', textShadow: '2px 2px 0 #8a1920' }}>VS</p>
                  <SwordsIcon className="w-5 h-5" style={{ color: 'rgba(255,245,214,0.3)' }} />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <img src={opponent.avatar} alt={opponent.name} className="w-16 h-16 object-cover"
                    style={{ border: '3px solid #cc2936', boxShadow: '4px 4px 0 #8a1920', borderRadius: 8 }} />
                  <p className="font-pixel text-sm" style={{ color: '#fff5d6' }}>{opponent.name}</p>
                  <p className="font-pixel text-[10px]" style={{ color: '#ffb700' }}>{opponent.elo} ELO</p>
                </div>
              </div>

              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ x: 2, y: 2, boxShadow: 'none' }}
                onClick={() => setState('playing')}
                className="btn-balatro btn-gold w-full max-w-xs py-4 flex items-center justify-center gap-2 cursor-pointer text-lg"
              >
                <SwordsIcon className="w-5 h-5" />
                Begin Duel
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── PLAYING ── */}
        {state === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden">

            {selectedMode === 'duel' && (
              <Duel1v1
                playerName={player.username}
                playerAvatar={player.avatar}
                playerElo={player.eloDuel ?? player.elo}
                equippedSkin={equippedSkin}
                opponent={opponent}
                onFinish={handleDuelFinish}
              />
            )}

            {(selectedMode === 'poker3' || selectedMode === 'poker5') && (
              <PokerTable
                mode={selectedMode}
                playerName={player.username}
                playerAvatar={player.avatar}
                equippedSkin={equippedSkin}
                equippedChipSkin={equippedChipSkin}
                onFinish={handlePokerFinish}
              />
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
