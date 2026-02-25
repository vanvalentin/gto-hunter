import React from 'react';
import { motion } from 'motion/react';
import { Zap, Users, Trophy } from 'lucide-react';
import type { ArenaMode } from '../../types';

interface ModeCard {
  mode: ArenaMode;
  title: string;
  subtitle: string;
  description: string;
  rules: string[];
  eloWin: string;
  eloLoss: string;
  goldWin: number;
  xpWin: number;
  icon: React.ReactNode;
  accent: string;
  shadow: string;
  borderColor: string;
  currentElo: number;
}

interface Props {
  eloDuel: number;
  eloPoker3: number;
  eloPoker5: number;
  onSelect: (mode: ArenaMode) => void;
  onBack: () => void;
}

export function ModeSelect({ eloDuel, eloPoker3, eloPoker5, onSelect, onBack }: Props) {
  const MODES: ModeCard[] = [
    {
      mode: 'duel',
      title: '1v1',
      subtitle: 'Duel',
      description: 'Head-to-head GTO showdown. Best decision wins each round.',
      rules: ['Best of 3 rounds', 'Different scenario per round', 'Highest EV takes the round'],
      eloWin: '+25',
      eloLoss: '-20',
      goldWin: 75,
      xpWin: 150,
      icon: <Zap className="w-6 h-6" />,
      accent: '#ffb700',
      shadow: '#8a6000',
      borderColor: '#b88a00',
      currentElo: eloDuel,
    },
    {
      mode: 'poker3',
      title: '3-Player',
      subtitle: 'Poker Table',
      description: 'Texas Hold\'em against 2 opponents. Chip up to climb the table.',
      rules: ['10 hands of no-limit Hold\'em', 'Starting stack: 1,000 chips', 'Placement decides ELO'],
      eloWin: '1st: +40',
      eloLoss: '3rd: -25',
      goldWin: 120,
      xpWin: 220,
      icon: <Users className="w-6 h-6" />,
      accent: '#4a90e2',
      shadow: '#1a4d8a',
      borderColor: '#2563eb',
      currentElo: eloPoker3,
    },
    {
      mode: 'poker5',
      title: '5-Player',
      subtitle: 'Poker Table',
      description: 'Texas Hold\'em against 4 opponents. Survive and dominate.',
      rules: ['15 hands of no-limit Hold\'em', 'Starting stack: 1,000 chips', 'Placement decides ELO'],
      eloWin: '1st: +60',
      eloLoss: '5th: -35',
      goldWin: 200,
      xpWin: 350,
      icon: <Trophy className="w-6 h-6" />,
      accent: '#a855f7',
      shadow: '#5b21b6',
      borderColor: '#7c3aed',
      currentElo: eloPoker5,
    },
  ];

  return (
    <motion.div
      key="mode-select"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 overflow-y-auto pb-6 px-4 pt-4"
    >
      <div className="mb-5">
        <p className="font-pixel text-[9px] uppercase tracking-widest mb-1"
          style={{ color: 'rgba(255,245,214,0.4)' }}>
          Select Mode
        </p>
        <p className="font-pixel text-xs" style={{ color: 'rgba(255,245,214,0.6)' }}>
          Each mode has its own ELO rating
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {MODES.map((card, i) => (
          <motion.div
            key={card.mode}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ x: 2, y: 2 }}
              onClick={() => onSelect(card.mode)}
              className="w-full text-left balatro-panel p-4 cursor-pointer"
              style={{ borderColor: card.borderColor, boxShadow: `4px 4px 0 ${card.shadow}` }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center shrink-0"
                    style={{
                      background: '#1a0f00',
                      border: `2px solid ${card.borderColor}`,
                      boxShadow: `2px 2px 0 ${card.shadow}`,
                      borderRadius: 6,
                      color: card.accent,
                    }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-pixel text-2xl leading-none"
                        style={{ color: card.accent, textShadow: `2px 2px 0 ${card.shadow}` }}>
                        {card.title}
                      </span>
                      <span className="font-pixel text-[10px] uppercase tracking-widest"
                        style={{ color: 'rgba(255,245,214,0.5)' }}>
                        {card.subtitle}
                      </span>
                    </div>
                    <p className="font-pixel text-[10px] mt-0.5" style={{ color: 'rgba(255,245,214,0.6)' }}>
                      {card.description}
                    </p>
                  </div>
                </div>
                {/* Mode ELO badge */}
                <div className="flex flex-col items-end shrink-0 ml-2">
                  <span className="font-pixel text-[8px] uppercase tracking-widest"
                    style={{ color: 'rgba(255,245,214,0.35)' }}>Rating</span>
                  <span className="font-pixel text-sm" style={{ color: card.accent }}>
                    {card.currentElo}
                  </span>
                </div>
              </div>

              {/* Rules */}
              <div className="flex flex-col gap-1 mb-3 pl-1">
                {card.rules.map((rule, ri) => (
                  <div key={ri} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: card.accent }} />
                    <span className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.5)' }}>
                      {rule}
                    </span>
                  </div>
                ))}
              </div>

              {/* Rewards row */}
              <div
                className="flex items-center justify-between px-3 py-2"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 6,
                }}
              >
                <div className="flex items-center gap-1">
                  <span className="font-pixel text-[9px]" style={{ color: '#3a8a4a' }}>
                    {card.eloWin} ELO
                  </span>
                  <span className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.2)' }}>/</span>
                  <span className="font-pixel text-[9px]" style={{ color: '#e63946' }}>
                    {card.eloLoss} ELO
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-pixel text-[9px]" style={{ color: '#ffb700' }}>
                    {card.goldWin}🪙
                  </span>
                  <span className="font-pixel text-[9px]" style={{ color: '#a78bfa' }}>
                    {card.xpWin}XP
                  </span>
                </div>
              </div>
            </motion.button>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onBack}
        className="btn-balatro btn-dark w-full mt-5 py-3 cursor-pointer"
      >
        ← Back to Lobby
      </motion.button>
    </motion.div>
  );
}
