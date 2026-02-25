import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Swords, Sparkles, Trophy, CheckCircle } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { TIER_SCENARIOS, isExample } from './scenarios';
import { CombinationsSheet } from './CombinationsSheet';
import type { TierID } from '../../types';

const TIER_META: Record<TierID, { label: string; btnClass: string; accentColor: string }> = {
  novice:       { label: 'Novice',       btnClass: 'btn-blue',   accentColor: '#4a90e2' },
  beginner:     { label: 'Beginner',     btnClass: 'btn-green',  accentColor: '#3a8a4a' },
  intermediate: { label: 'Intermediate', btnClass: 'btn-orange', accentColor: '#e8622a' },
  expert:       { label: 'Expert',       btnClass: 'btn-red',    accentColor: '#cc2936' },
  legend:       { label: 'Legend',       btnClass: 'btn-gold',   accentColor: '#ffb700' },
};

function StarRow({ filled, color }: { filled: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <Star key={i} className="w-3 h-3"
          style={{ color: i < filled ? color : 'rgba(255,245,214,0.15)', fill: i < filled ? color : 'none' }}
          strokeWidth={1.5} />
      ))}
    </div>
  );
}

interface Props {
  tierId: TierID;
  onSelectExercise: (exerciseIdx: number) => void;
  onBack: () => void;
}

export function ExerciseSelect({ tierId, onSelectExercise, onBack }: Props) {
  const [showCombinations, setShowCombinations] = useState(false);
  const { exerciseProgress } = usePlayerStore();
  const exercises = TIER_SCENARIOS[tierId];
  const meta = TIER_META[tierId];

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
              {meta.label.toUpperCase()} · SELECT EXERCISE
            </p>
            <h2 className="font-pixel text-base" style={{ color: '#ffb700', textShadow: '2px 2px 0 #8a6000' }}>
              Choose a Hand
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

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {exercises.map((ex, idx) => {
          const example = isExample(ex);
          const progress = exerciseProgress[ex.id];
          const stars = progress?.stars ?? 0;
          const bestScore = progress?.bestScore ?? 0;
          const played = (progress?.timesPlayed ?? 0) > 0;

          return (
            <motion.button
              key={ex.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.15 }}
              onClick={() => onSelectExercise(idx)}
              className="w-full text-left balatro-panel btn-balatro"
              style={{ fontFamily: 'inherit', textTransform: 'none', letterSpacing: 'normal' }}
              whileHover={{ x: 4 }}
              whileTap={{ x: 2, y: 2, boxShadow: 'none' }}
            >
              <div className="p-3">
                {/* Main row */}
                <div className="flex items-center gap-3">
                  {/* Icon badge */}
                  <div
                    className={`w-11 h-11 rounded flex items-center justify-center shrink-0 ${example ? 'btn-blue' : meta.btnClass}`}
                    style={{ minWidth: 44 }}
                  >
                    {example
                      ? <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
                      : <Swords className="w-5 h-5 text-white" strokeWidth={2} />
                    }
                  </div>

                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-pixel text-sm leading-none" style={{ color: '#fff5d6' }}>
                        {ex.handLabel}
                      </span>
                      <span
                        className="font-pixel text-[8px] px-1.5 py-0.5 rounded"
                        style={{
                          background: example ? 'rgba(37,99,235,0.2)' : 'rgba(0,0,0,0.35)',
                          border: `1px solid ${example ? '#1a4d8a' : 'var(--panel-border)'}`,
                          color: example ? '#4a90e2' : meta.accentColor,
                        }}
                      >
                        {example ? 'EXAMPLE' : 'PRACTICE'}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,245,214,0.5)', fontFamily: 'Pixelify Sans' }}>
                      {ex.conceptNote}
                    </p>
                  </div>

                  {/* Right: stars or checkmark */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {example
                      ? (played
                          ? <CheckCircle className="w-5 h-5" style={{ color: '#4a90e2' }} strokeWidth={2} />
                          : <div className="w-5 h-5 rounded-full" style={{ border: '2px solid rgba(255,255,255,0.15)' }} />
                        )
                      : <StarRow filled={stars} color={meta.accentColor} />
                    }
                    <span className="text-lg font-pixel" style={{ color: 'rgba(255,245,214,0.3)' }}>›</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between mt-2.5 pt-2"
                  style={{ borderTop: '1px solid rgba(122,79,42,0.3)' }}>
                  {/* Left: street count or "guided" */}
                  {example ? (
                    <span className="font-pixel text-[9px]" style={{ color: '#4a90e2' }}>
                      ✦ Guided tutorial with step-by-step tips
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Swords className="w-3 h-3" style={{ color: 'rgba(255,245,214,0.35)' }} strokeWidth={2} />
                      <span className="font-pixel text-[8px] px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--panel-mid)', border: '1px solid var(--panel-border)', color: meta.accentColor }}>
                        {ex.streets?.join(' · ')}
                      </span>
                    </div>
                  )}

                  {/* Right: completion status */}
                  {played ? (
                    example ? (
                      <span className="font-pixel text-[8px]" style={{ color: '#4a90e2' }}>Completed ✓</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {bestScore > 0 && (
                          <span className="font-pixel text-[8px]" style={{ color: 'rgba(255,245,214,0.35)' }}>
                            Best: {bestScore.toLocaleString()}
                          </span>
                        )}
                        <span className="font-pixel text-[9px]" style={{ color: meta.accentColor }}>
                          {stars === 3 ? '★★★' : stars === 2 ? '★★☆' : '★☆☆'}
                        </span>
                      </div>
                    )
                  ) : (
                    <span className="font-pixel text-[8px]" style={{ color: 'rgba(255,245,214,0.25)' }}>
                      Not played yet
                    </span>
                  )}
                </div>
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
