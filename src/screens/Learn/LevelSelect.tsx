import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Swords, BookOpen, Crown, Flame, Lock, Star, Zap, Coins, ChevronRight, Trophy } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { CombinationsSheet } from './CombinationsSheet';
import type { TierID } from '../../types';

interface TierDef {
  id: TierID;
  label: string;
  subtitle: string;
  description: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  btnClass: string;
  accentColor: string;
  difficultyDots: number;
  xpReward: number;
  goldReward: number;
  multiplier: string;
}

const TIERS: TierDef[] = [
  {
    id: 'novice',
    label: 'Novice',
    subtitle: 'The Initiate',
    description: 'Preflop basics — call or fold on simple boards',
    Icon: Shield,
    btnClass: 'btn-blue',
    accentColor: '#4a90e2',
    difficultyDots: 1,
    xpReward: 50,
    goldReward: 25,
    multiplier: '×1',
  },
  {
    id: 'beginner',
    label: 'Beginner',
    subtitle: 'The Apprentice',
    description: 'Two-street spots — pot odds, draws, basic c-bets',
    Icon: Swords,
    btnClass: 'btn-green',
    accentColor: '#3a8a4a',
    difficultyDots: 2,
    xpReward: 100,
    goldReward: 50,
    multiplier: '×1.5',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    subtitle: 'The Tactician',
    description: 'Multi-street play — ranges, frequencies, semi-bluffs',
    Icon: BookOpen,
    btnClass: 'btn-orange',
    accentColor: '#e8622a',
    difficultyDots: 3,
    xpReward: 175,
    goldReward: 100,
    multiplier: '×2',
  },
  {
    id: 'expert',
    label: 'Expert',
    subtitle: 'The Master',
    description: '3-bet pots — complex hero calls and bluff lines',
    Icon: Crown,
    btnClass: 'btn-red',
    accentColor: '#cc2936',
    difficultyDots: 4,
    xpReward: 300,
    goldReward: 175,
    multiplier: '×3',
  },
  {
    id: 'legend',
    label: 'Legend',
    subtitle: 'The GTO God',
    description: 'Solver-level balance — full range exploitation',
    Icon: Flame,
    btnClass: 'btn-gold',
    accentColor: '#ffb700',
    difficultyDots: 5,
    xpReward: 500,
    goldReward: 300,
    multiplier: '×5',
  },
];

const TIER_ORDER: TierID[] = ['novice', 'beginner', 'intermediate', 'expert', 'legend'];

function StarRow({ filled, color }: { filled: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          className="w-3.5 h-3.5"
          style={{
            color: i < filled ? color : 'rgba(255,245,214,0.15)',
            fill: i < filled ? color : 'none',
          }}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function DifficultyDots({ count, color }: { count: number; color: string }) {
  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            background: i <= count ? color : 'rgba(255,245,214,0.1)',
            border: `1px solid ${i <= count ? color : 'rgba(255,245,214,0.15)'}`,
          }}
        />
      ))}
    </div>
  );
}

interface Props {
  onStartMission: (tierId: TierID) => void;
}

export function LevelSelect({ onStartMission }: Props) {
  const [showCombinations, setShowCombinations] = useState(false);
  const { tierProgress } = usePlayerStore();

  const isUnlocked = (tierId: TierID) => {
    const idx = TIER_ORDER.indexOf(tierId);
    if (idx === 0) return true;
    return (tierProgress[TIER_ORDER[idx - 1]]?.timesPlayed ?? 0) > 0;
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col felt-bg overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-4 pb-3 shrink-0"
        style={{ borderBottom: '2px solid rgba(0,0,0,0.25)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-pixel text-[9px] tracking-widest mb-0.5" style={{ color: 'rgba(255,245,214,0.4)' }}>
              SELECT DIFFICULTY
            </p>
            <h2 className="font-pixel text-base" style={{ color: '#ffb700', textShadow: '2px 2px 0 #8a6000' }}>
              Choose Your Challenge
            </h2>
          </div>
          {/* Combinations button */}
          <button
            onClick={() => setShowCombinations(true)}
            className="flex items-center gap-1.5 px-3 py-2 btn-balatro btn-dark"
          >
            <Trophy className="w-3.5 h-3.5" style={{ color: '#ffb700' }} strokeWidth={2} />
            <span className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.7)' }}>Hands</span>
          </button>
        </div>
      </motion.div>

      {/* Tier list — same layout as Hub menu items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {TIERS.map((tier, idx) => {
          const unlocked = isUnlocked(tier.id);
          const progress = tierProgress[tier.id];
          const stars = progress?.stars ?? 0;
          const bestScore = progress?.bestScore ?? 0;
          const played = (progress?.timesPlayed ?? 0) > 0;
          const Icon = tier.Icon;

          return (
            <motion.button
              key={tier.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.15 }}
              onClick={() => unlocked && onStartMission(tier.id)}
              disabled={!unlocked}
              className="w-full text-left balatro-panel btn-balatro"
              style={{
                fontFamily: 'inherit',
                textTransform: 'none',
                letterSpacing: 'normal',
                opacity: unlocked ? 1 : 0.45,
                cursor: unlocked ? 'pointer' : 'default',
              }}
              whileHover={unlocked ? { x: 4 } : {}}
              whileTap={unlocked ? { x: 2, y: 2, boxShadow: 'none' } : {}}
            >
              <div className="p-3">
                {/* Main row — mirrors Hub menu items */}
                <div className="flex items-center gap-3">
                  {/* Icon badge */}
                  <div
                    className={`w-11 h-11 rounded flex items-center justify-center shrink-0 ${unlocked ? tier.btnClass : 'btn-dark'}`}
                    style={{ minWidth: 44 }}
                  >
                    {unlocked
                      ? <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                      : <Lock className="w-4 h-4" style={{ color: 'rgba(255,245,214,0.35)' }} strokeWidth={2} />
                    }
                  </div>

                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-sm leading-none" style={{ color: '#fff5d6' }}>
                        {tier.label}
                      </span>
                      <span className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.4)' }}>
                        {tier.subtitle}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,245,214,0.5)', fontFamily: 'Pixelify Sans' }}>
                      {unlocked ? tier.description : `Complete ${TIER_ORDER[idx - 1]} to unlock`}
                    </p>
                  </div>

                  {/* Right side */}
                  {unlocked ? (
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <StarRow filled={stars} color={tier.accentColor} />
                      <span className="text-lg font-pixel" style={{ color: 'rgba(255,245,214,0.3)' }}>›</span>
                    </div>
                  ) : (
                    <span className="text-lg font-pixel" style={{ color: 'rgba(255,245,214,0.15)' }}>›</span>
                  )}
                </div>

                {/* Extra row — only for unlocked tiers */}
                {unlocked && (
                  <div
                    className="flex items-center justify-between mt-2.5 pt-2"
                    style={{ borderTop: '1px solid rgba(122,79,42,0.3)' }}
                  >
                    {/* Difficulty */}
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-[8px]" style={{ color: 'rgba(255,245,214,0.35)' }}>
                        Difficulty
                      </span>
                      <DifficultyDots count={tier.difficultyDots} color={tier.accentColor} />
                    </div>

                    {/* Rewards */}
                    <div className="flex items-center gap-2.5">
                      {played && bestScore > 0 && (
                        <span className="font-pixel text-[8px]" style={{ color: 'rgba(255,245,214,0.35)' }}>
                          Best: {bestScore.toLocaleString()}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <Coins className="w-3 h-3" style={{ color: '#ffb700' }} strokeWidth={2} />
                        <span className="font-pixel text-[9px]" style={{ color: '#ffb700' }}>+{tier.goldReward}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" style={{ color: '#4a90e2' }} strokeWidth={2} />
                        <span className="font-pixel text-[9px]" style={{ color: '#4a90e2' }}>+{tier.xpReward}</span>
                      </div>
                      <div
                        className="px-1.5 py-0.5 rounded"
                        style={{
                          background: 'var(--panel-mid)',
                          border: '2px solid var(--panel-border)',
                        }}
                      >
                        <span className="font-pixel text-[9px]" style={{ color: tier.accentColor }}>
                          {tier.multiplier}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}

        <div className="h-4 shrink-0" />
      </div>

      <CombinationsSheet isOpen={showCombinations} onClose={() => setShowCombinations(false)} />
    </div>
  );
}
