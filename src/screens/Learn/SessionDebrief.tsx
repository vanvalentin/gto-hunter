import React, { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Star, Shield, Swords, BookOpen, Crown, Flame, ChevronRight, RotateCcw, ListChecks } from 'lucide-react';
import { ChipDisplay } from '../../components/ui/ChipDisplay';
import { useGameStore } from '../../store/gameStore';
import { usePlayerStore } from '../../store/playerStore';
import { TIER_SCENARIOS } from './scenarios';
import type { TierID } from '../../types';

interface Props {
  onHome: () => void;
  onReplay: () => void;
  onNextExercise: () => void;
}

const TIER_META: Record<TierID, {
  label: string;
  subtitle: string;
  primary: string;
  border: string;
  shadow: string;
  glow: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  nextTier?: TierID;
  nextLabel?: string;
}> = {
  novice: {
    label: 'Novice', subtitle: 'The Initiate',
    primary: '#cd7f32', border: '#8a5200', shadow: '#5a3400', glow: 'rgba(205,127,50,0.4)',
    Icon: Shield, nextTier: 'beginner', nextLabel: 'Beginner',
  },
  beginner: {
    label: 'Beginner', subtitle: 'The Apprentice',
    primary: '#4ade80', border: '#15803d', shadow: '#0f6330', glow: 'rgba(74,222,128,0.4)',
    Icon: Swords, nextTier: 'intermediate', nextLabel: 'Intermediate',
  },
  intermediate: {
    label: 'Intermediate', subtitle: 'The Tactician',
    primary: '#60a5fa', border: '#1a4d8a', shadow: '#123666', glow: 'rgba(96,165,250,0.4)',
    Icon: BookOpen, nextTier: 'expert', nextLabel: 'Expert',
  },
  expert: {
    label: 'Expert', subtitle: 'The Master',
    primary: '#c084fc', border: '#7e22ce', shadow: '#5b18a0', glow: 'rgba(192,132,252,0.4)',
    Icon: Crown, nextTier: 'legend', nextLabel: 'Legend',
  },
  legend: {
    label: 'Legend', subtitle: 'The GTO God',
    primary: '#ffb700', border: '#b88a00', shadow: '#8a6000', glow: 'rgba(255,183,0,0.5)',
    Icon: Flame,
  },
};

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="balatro-panel p-3 flex flex-col gap-1">
      <span className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.4)' }}>{label}</span>
      <span className="font-pixel text-lg leading-none" style={{ color }}>{value}</span>
      {sub && <span className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.3)' }}>{sub}</span>}
    </div>
  );
}

function StarBurst({ filled, color, glow }: { filled: number; color: string; glow: string }) {
  return (
    <div className="flex justify-center gap-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.4 + i * 0.15 }}
        >
          <Star
            className="w-10 h-10"
            style={{
              color: i < filled ? color : 'rgba(255,255,255,0.1)',
              fill: i < filled ? color : 'none',
              filter: i < filled ? `drop-shadow(0 0 8px ${glow})` : 'none',
            }}
            strokeWidth={i < filled ? 1.5 : 1}
          />
        </motion.div>
      ))}
    </div>
  );
}

export function SessionDebrief({ onHome, onReplay, onNextExercise }: Props) {
  const { activeTier, activeExerciseIdx, accuracy, totalEV, correctDecisions, totalDecisions } = useGameStore();
  const { player, addGold, addXP, completeTier, completeExercise, tierProgress, exerciseProgress } = usePlayerStore();

  const exercises = TIER_SCENARIOS[activeTier];
  const activeExercise = exercises[activeExerciseIdx] ?? exercises[0];
  const hasNextExercise = activeExerciseIdx < exercises.length - 1;

  const meta = TIER_META[activeTier];
  const TierIcon = meta.Icon;

  const stars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : accuracy > 0 || totalDecisions > 0 ? 1 : 0;
  const prevBestExercise = exerciseProgress[activeExercise?.id ?? '']?.stars ?? 0;
  const isNewRecord = stars > prevBestExercise;

  const TIER_MULTIPLIERS: Record<TierID, number> = {
    novice: 1, beginner: 1.5, intermediate: 2, expert: 3, legend: 5,
  };
  const multiplier = TIER_MULTIPLIERS[activeTier];

  const goldEarned = Math.round((correctDecisions * 10 + (accuracy >= 80 ? 50 : 0)) * multiplier);
  const xpEarned   = Math.round((correctDecisions * 25 + (accuracy >= 80 ? 100 : 0)) * multiplier);
  const chips = accuracy;
  const mult  = Math.max(1, Math.round(Math.abs(totalEV)));
  const score = Math.round(chips * mult * multiplier);

  const gradeData = useMemo(() => {
    if (accuracy >= 90) return { letter: 'S', color: '#ffb700' };
    if (accuracy >= 75) return { letter: 'A', color: '#4a90e2' };
    if (accuracy >= 60) return { letter: 'B', color: '#3a8a4a' };
    if (accuracy >= 40) return { letter: 'C', color: '#e8622a' };
    return { letter: 'D', color: '#e63946' };
  }, [accuracy]);

  useEffect(() => {
    if (totalDecisions > 0) {
      addGold(goldEarned);
      addXP(xpEarned);
      completeTier(activeTier, stars, score);
      if (activeExercise) {
        completeExercise(activeExercise.id, stars, score);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 overflow-y-auto pb-8 felt-bg">

      {/* Header — tier badge + score */}
      <div
        className="text-center pt-5 pb-4 px-5 relative"
        style={{ background: '#0f2219', borderBottom: '3px solid rgba(0,0,0,0.4)' }}
      >
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 70% at 50% 0%, ${meta.glow}, transparent)` }}
        />

        {/* Tier + exercise pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3 relative"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: `2px solid ${meta.border}`,
            boxShadow: `2px 2px 0 ${meta.shadow}, 0 0 16px ${meta.glow}`,
          }}
        >
          <TierIcon className="w-3.5 h-3.5" style={{ color: meta.primary }} strokeWidth={2} />
          <span className="font-pixel text-[10px]" style={{ color: meta.primary }}>{meta.label.toUpperCase()}</span>
          <span className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.4)' }}>
            · Exercise {activeExerciseIdx + 1}/{exercises.length}
          </span>
        </motion.div>
        {activeExercise && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="font-pixel text-[10px] mb-1 relative"
            style={{ color: meta.primary }}
          >
            {activeExercise.handLabel}
          </motion.p>
        )}

        <p className="font-pixel text-[10px] mb-2 relative" style={{ color: 'rgba(255,245,214,0.5)' }}>Session Complete</p>

        {/* Score */}
        <div className="flex justify-center mb-2">
          <ChipDisplay chips={chips} mult={mult} size="lg" />
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-pixel text-2xl relative"
          style={{ color: '#ffb700', textShadow: '2px 2px 0 #8a6000' }}
        >
          {score.toLocaleString()}
        </motion.div>
        <p className="font-pixel text-[10px] mt-0.5 relative" style={{ color: 'rgba(255,245,214,0.4)' }}>Total Score</p>

        {/* New record banner */}
        {isNewRecord && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 inline-block px-3 py-1 rounded relative"
            style={{
              background: `linear-gradient(135deg, ${meta.primary}, ${meta.border})`,
              border: `2px solid ${meta.border}`,
              boxShadow: `2px 2px 0 ${meta.shadow}`,
            }}
          >
            <span className="font-pixel text-[9px] text-white">✦ New Record!</span>
          </motion.div>
        )}
      </div>

      {/* Grade + Stars */}
      <div className="flex flex-col items-center py-4 px-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="w-20 h-20 rounded-xl flex items-center justify-center balatro-panel mb-2"
          style={{
            border: `3px solid ${gradeData.color}`,
            boxShadow: `4px 4px 0 rgba(0,0,0,0.5), 0 0 24px ${gradeData.color}50`,
          }}
        >
          <span className="font-pixel text-4xl" style={{ color: gradeData.color }}>{gradeData.letter}</span>
        </motion.div>

        <StarBurst filled={stars} color={meta.primary} glow={meta.glow} />

        <p className="font-pixel text-[9px] mt-1" style={{ color: 'rgba(255,245,214,0.4)' }}>
          {stars === 3 ? 'Perfect run!' : stars === 2 ? 'Strong play' : stars === 1 ? 'Keep practicing' : 'Try again'}
        </p>
      </div>

      {/* Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mx-4 mb-4 p-3 balatro-panel"
        style={{ border: `3px solid ${meta.border}`, boxShadow: `4px 4px 0 ${meta.shadow}` }}
      >
        <p className="font-pixel text-[10px] text-center mb-3" style={{ color: meta.primary }}>Rewards Earned</p>
        <div className="flex justify-center gap-4">
          <div className="btn-balatro btn-blue px-4 py-2 flex items-center gap-2" style={{ fontSize: 14 }}>🪙 +{goldEarned}</div>
          <div className="btn-balatro btn-red px-4 py-2 flex items-center gap-2" style={{ fontSize: 14 }}>⚡ +{xpEarned}</div>
          <div
            className="px-4 py-2 rounded flex items-center gap-1 font-pixel text-sm"
            style={{ background: 'rgba(0,0,0,0.4)', border: `2px solid ${meta.border}`, boxShadow: `2px 2px 0 ${meta.shadow}`, color: meta.primary }}
          >
            ×{multiplier}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="mx-4 grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Accuracy',     value: `${accuracy}%`,          sub: `${correctDecisions}/${totalDecisions} optimal`, color: '#4a90e2' },
          { label: 'Total EV',     value: `${totalEV > 0 ? '+' : ''}${totalEV.toFixed(1)} BB`, sub: 'Expected value', color: '#ffb700' },
          { label: 'Tier',         value: meta.label,               sub: meta.subtitle, color: meta.primary },
          { label: 'Score',        value: score.toLocaleString(),   sub: `${chips} × ${mult} × ${multiplier}`, color: '#3a8a4a' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.06 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* XP bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="mx-4 balatro-panel p-3 mb-4">
        <div className="flex justify-between font-pixel text-[10px] mb-1">
          <span style={{ color: 'rgba(255,245,214,0.5)' }}>Level {player.level}</span>
          <span style={{ color: '#4a90e2' }}>{player.xp}/{player.xpToNext} XP</span>
        </div>
        <div className="w-full h-3 rounded overflow-hidden" style={{ background: '#0f2219', border: '2px solid rgba(0,0,0,0.4)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.round((player.xp / player.xpToNext) * 100)}%` }}
            transition={{ delay: 1, duration: 0.8 }}
            className="h-full"
            style={{ background: 'linear-gradient(90deg, #2563eb, #4a90e2)' }}
          />
        </div>
      </motion.div>

      {/* Next tier unlock hint */}
      {meta.nextTier && stars >= 1 && (tierProgress[activeTier]?.timesPlayed ?? 0) === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="mx-4 balatro-panel p-3 flex items-center gap-3 mb-4"
          style={{ border: `2px solid ${meta.border}`, boxShadow: `3px 3px 0 ${meta.shadow}` }}
        >
          <div
            className="w-10 h-10 rounded flex items-center justify-center shrink-0"
            style={{ background: 'var(--panel-mid)', border: `2px solid ${meta.border}` }}
          >
            <Star className="w-5 h-5" style={{ color: meta.primary }} fill={meta.primary} strokeWidth={0} />
          </div>
          <div className="flex-1">
            <p className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.4)' }}>Next Tier Unlocked</p>
            <p className="font-pixel text-sm mt-0.5" style={{ color: meta.primary }}>{meta.nextLabel}</p>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: meta.primary }} />
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="mx-4 flex flex-col gap-2 mb-2"
      >
        {hasNextExercise && (
          <button
            onClick={onNextExercise}
            className="w-full py-3.5 btn-balatro btn-gold flex items-center justify-center gap-2"
          >
            <ListChecks className="w-4 h-4" />
            Next Exercise
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        <div className="flex gap-2">
          <button
            onClick={onReplay}
            className="flex-1 py-3 btn-balatro btn-dark flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
          <button
            onClick={onNextExercise}
            className="flex-1 py-3 btn-balatro btn-blue flex items-center justify-center gap-2"
          >
            <ListChecks className="w-3.5 h-3.5" />
            All Exercises
          </button>
          <button
            onClick={onHome}
            className="flex-1 py-3 btn-balatro btn-dark"
          >
            Menu
          </button>
        </div>
      </motion.div>
    </div>
  );
}
