import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Star, Fish } from 'lucide-react';
import { PlayingCard } from '../../components/cards/PlayingCard';
import { TechTerm } from '../../components/ui/TechTerm';
import { PokerChip } from '../../components/ui/ChipDisplay';
import { usePlayerStore, AVAILABLE_CHIP_SKINS, AVAILABLE_SKINS } from '../../store/playerStore';
import type { Decision } from '../../types';

// ─── Scenario Data ────────────────────────────────────────────────────────────

interface Street {
  label: string;
  communityCards: { rank: string; suit: 's' | 'h' | 'c' | 'd' }[];
  pot: number;
  oppBet: number;
  optimalDecision: Decision;
  evTable: Record<Decision, number>;
  gtoFreq: { fold: number; call: number; raise: number };
  narrative: string;
}

interface Hand {
  id: number;
  title: string;
  heroHand: { rank: string; suit: 's' | 'h' | 'c' | 'd' }[];
  streets: Street[];
}

const HANDS: Hand[] = [
  {
    id: 1,
    title: 'Easy Value',
    heroHand: [
      { rank: 'A', suit: 's' },
      { rank: 'K', suit: 'd' },
    ],
    streets: [
      {
        label: 'Flop',
        communityCards: [
          { rank: 'A', suit: 'h' },
          { rank: '7', suit: 'c' },
          { rank: '2', suit: 'd' },
        ],
        pot: 20,
        oppBet: 6,
        optimalDecision: 'raise',
        evTable: { fold: -10.0, call: 3.5, raise: 8.2 },
        gtoFreq: { fold: 0, call: 20, raise: 80 },
        narrative:
          'Carl min-bets into you with top pair top kicker. Raise big — fish call with A-x, 7-x, even 2-x.',
      },
      {
        label: 'River',
        communityCards: [
          { rank: 'A', suit: 'h' },
          { rank: '7', suit: 'c' },
          { rank: '2', suit: 'd' },
          { rank: '9', suit: 's' },
          { rank: '3', suit: 'h' },
        ],
        pot: 44,
        oppBet: 0,
        optimalDecision: 'raise',
        evTable: { fold: 0, call: 0, raise: 9.1 },
        gtoFreq: { fold: 0, call: 5, raise: 95 },
        narrative:
          "Blank runout. Carl checks river — he's given up. Bet large for max value against his sticky second pair.",
      },
    ],
  },
  {
    id: 2,
    title: 'Overpair Trap',
    heroHand: [
      { rank: 'K', suit: 'c' },
      { rank: 'K', suit: 'h' },
    ],
    streets: [
      {
        label: 'Flop',
        communityCards: [
          { rank: 'J', suit: 'd' },
          { rank: '7', suit: 's' },
          { rank: '2', suit: 'h' },
        ],
        pot: 18,
        oppBet: 4,
        optimalDecision: 'raise',
        evTable: { fold: -9.0, call: 5.1, raise: 11.3 },
        gtoFreq: { fold: 0, call: 15, raise: 85 },
        narrative:
          "Pocket Kings on a dry flop. Carl bets 4BB with what is likely J-x. Raise now — build a pot you're crushing.",
      },
      {
        label: 'Turn',
        communityCards: [
          { rank: 'J', suit: 'd' },
          { rank: '7', suit: 's' },
          { rank: '2', suit: 'h' },
          { rank: '4', suit: 'c' },
        ],
        pot: 44,
        oppBet: 10,
        optimalDecision: 'raise',
        evTable: { fold: -22.0, call: 8.2, raise: 14.7 },
        gtoFreq: { fold: 0, call: 25, raise: 75 },
        narrative:
          "Turn is a total blank. Carl fires again with J-x. You're still miles ahead — punish him with a big raise.",
      },
    ],
  },
  {
    id: 3,
    title: 'River Value Shove',
    heroHand: [
      { rank: 'Q', suit: 'h' },
      { rank: 'Q', suit: 'c' },
    ],
    streets: [
      {
        label: 'Flop',
        communityCards: [
          { rank: 'Q', suit: 'd' },
          { rank: '8', suit: 'h' },
          { rank: '3', suit: 'c' },
        ],
        pot: 22,
        oppBet: 8,
        optimalDecision: 'call',
        evTable: { fold: -11.0, call: 12.5, raise: 10.8 },
        gtoFreq: { fold: 0, call: 65, raise: 35 },
        narrative:
          'You flopped top set! Slow down — call here to keep Carl in the hand. Let him think his bluffs have equity.',
      },
      {
        label: 'River',
        communityCards: [
          { rank: 'Q', suit: 'd' },
          { rank: '8', suit: 'h' },
          { rank: '3', suit: 'c' },
          { rank: '5', suit: 's' },
          { rank: 'K', suit: 's' },
        ],
        pot: 38,
        oppBet: 15,
        optimalDecision: 'raise',
        evTable: { fold: -19.0, call: 10.2, raise: 18.6 },
        gtoFreq: { fold: 0, call: 20, raise: 80 },
        narrative:
          "King on river — Carl bets out with his new top pair. You have a full house. Jam it in, he can't fold K-x.",
      },
    ],
  },
];

// ─── GTO Frequency Bar ────────────────────────────────────────────────────────

interface GtoBarProps {
  fold: number;
  call: number;
  raise: number;
  highlighted: Decision | null;
}

function GtoBar({ fold, call, raise, highlighted }: GtoBarProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="font-pixel text-[9px]" style={{ color: highlighted === 'fold'  ? '#e63946' : 'rgba(230,57,70,0.4)'  }}>Fold {fold}%</span>
        <span className="font-pixel text-[9px]" style={{ color: highlighted === 'call'  ? '#4a90e2' : 'rgba(74,144,226,0.4)' }}>Call {call}%</span>
        <span className="font-pixel text-[9px]" style={{ color: highlighted === 'raise' ? '#ffb700' : 'rgba(255,183,0,0.4)'  }}>Raise {raise}%</span>
      </div>
      <div className="w-full h-3 flex overflow-hidden"
        style={{ border: '2px solid #3a2010', borderRadius: 4, background: '#0f2219' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${fold}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ background: fold > 0 ? '#cc2936' : 'transparent' }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${call}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ background: '#2563eb' }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${raise}%` }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ background: '#b88a00' }}
        />
      </div>
    </div>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────

interface ResultsProps {
  results: { isOptimal: boolean; ev: number }[];
  onBack: () => void;
}

function ResultsScreen({ results, onBack }: ResultsProps) {
  const { addGold, addXP, completeStage } = usePlayerStore();
  const rewarded = useRef(false);

  const total    = results.length;
  const correct  = results.filter((r) => r.isOptimal).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const totalEV  = results.reduce((sum, r) => sum + r.ev, 0);

  const stars      = accuracy >= 80 ? 3 : accuracy >= 60 ? 2 : accuracy >= 40 ? 1 : 0;
  const goldReward = [25, 50, 75, 100][stars];
  const xpReward   = [50, 100, 150, 200][stars];

  const grade =
    accuracy >= 90 ? { letter: 'S', color: '#ffb700' } :
    accuracy >= 75 ? { letter: 'A', color: '#4a90e2' } :
    accuracy >= 60 ? { letter: 'B', color: '#3a8a4a' } :
    accuracy >= 40 ? { letter: 'C', color: '#e8622a' } :
    { letter: 'D', color: '#e63946' };

  useEffect(() => {
    if (!rewarded.current) {
      rewarded.current = true;
      addGold(goldReward);
      addXP(xpReward);
      completeStage('river-district', 1, stars);
    }
  }, []);

  return (
    <div className="flex-1 overflow-y-auto pb-8 felt-dark-bg">
      {/* Header */}
      <div className="text-center pt-6 pb-4 px-5"
        style={{ background: '#0f2219', borderBottom: '3px solid rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <Fish className="w-4 h-4" style={{ color: '#ffb700' }} />
          <p className="font-pixel text-xs uppercase tracking-widest" style={{ color: '#ffb700' }}>
            Fish Tables — Complete
          </p>
          <Fish className="w-4 h-4" style={{ color: '#ffb700' }} />
        </div>
        <p className="font-pixel text-[10px]" style={{ color: 'rgba(255,245,214,0.4)' }}>
          The River District · Stage 1
        </p>
      </div>

      {/* Grade */}
      <div className="flex justify-center pt-6 pb-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="w-24 h-24 flex items-center justify-center"
          style={{
            background: '#160d05',
            border: `3px solid ${grade.color}`,
            boxShadow: `4px 4px 0 rgba(0,0,0,0.6), 0 0 20px ${grade.color}40`,
            borderRadius: 8,
          }}
        >
          <span className="font-pixel text-5xl" style={{ color: grade.color }}>{grade.letter}</span>
        </motion.div>
      </div>

      {/* Stars */}
      <div className="flex justify-center gap-3 mb-6">
        {[1, 2, 3].map((s) => (
          <motion.div
            key={s}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + s * 0.15, type: 'spring', stiffness: 300, damping: 15 }}
          >
            <Star className="w-8 h-8"
              style={{
                color: s <= stars ? '#ffb700' : 'rgba(255,183,0,0.2)',
                fill:  s <= stars ? '#ffb700' : 'none',
                filter: s <= stars ? 'drop-shadow(0 0 6px #ffb700)' : 'none',
              }} />
          </motion.div>
        ))}
      </div>

      {/* Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mx-4 mb-4 p-4"
        style={{ background: '#1a0f00', border: '3px solid #b88a00', borderRadius: 8, boxShadow: '4px 4px 0 #6a4800' }}
      >
        <p className="font-pixel text-[9px] text-center uppercase tracking-widest mb-3" style={{ color: '#ffb700' }}>
          Rewards Earned
        </p>
        <div className="flex justify-center gap-3">
          <div className="chip-box px-4 py-2 text-sm flex items-center gap-1.5">
            🪙 <span>+{goldReward}</span>
          </div>
          <div className="mult-box px-4 py-2 text-sm flex items-center gap-1.5">
            ⚡ <span>+{xpReward} XP</span>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="mx-4 grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Accuracy',    value: `${accuracy}%`,                       sub: `${correct}/${total} optimal`,      color: '#4a90e2' },
          { label: 'Total EV',    value: `${totalEV > 0 ? '+' : ''}${totalEV.toFixed(1)} BB`, sub: 'Expected value',  color: '#ffb700' },
          { label: 'Hands Played', value: '3',                                 sub: 'Fish Tables session',              color: '#3a8a4a' },
          { label: 'GTO Grade',   value: grade.letter,                         sub: accuracy >= 80 ? 'Crushing it!' : accuracy >= 60 ? 'Solid play' : 'Keep studying', color: grade.color },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.06 }}
            className="p-3 balatro-panel"
          >
            <p className="font-pixel text-[9px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,245,214,0.4)' }}>{stat.label}</p>
            <p className="font-pixel text-xl leading-none mb-0.5" style={{ color: stat.color }}>{stat.value}</p>
            {stat.sub && <p className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.35)' }}>{stat.sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* Hand breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mx-4 mb-6 balatro-panel overflow-hidden"
      >
        <p className="font-pixel text-[9px] uppercase tracking-widest px-4 pt-3 pb-2" style={{ color: 'rgba(255,245,214,0.4)' }}>
          Decision Breakdown
        </p>
        {results.map((r, i) => {
          const handNum    = Math.floor(i / 2) + 1;
          const streetLabel = i % 2 === 0
            ? HANDS[Math.floor(i / 2)].streets[0].label
            : HANDS[Math.floor(i / 2)].streets[1].label;
          return (
            <div key={i} className="flex items-center justify-between px-4 py-2.5"
              style={{ borderTop: i > 0 ? '2px solid rgba(0,0,0,0.4)' : 'none' }}>
              <span className="font-pixel text-[10px]" style={{ color: 'rgba(255,245,214,0.5)' }}>
                Hand {handNum} · {streetLabel}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[10px]" style={{ color: r.ev > 0 ? '#3a8a4a' : '#e63946' }}>
                  {r.ev > 0 ? '+' : ''}{r.ev.toFixed(1)} BB
                </span>
                <span className="font-pixel text-xs" style={{ color: r.isOptimal ? '#3a8a4a' : '#e63946' }}>
                  {r.isOptimal ? '✓' : '✗'}
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mx-4"
      >
        <button onClick={onBack} className="btn-balatro btn-green w-full py-4 cursor-pointer">
          ← Back to World Map
        </button>
      </motion.div>
    </div>
  );
}

// ─── Main Game Component ──────────────────────────────────────────────────────

interface Props {
  onComplete: (stars: number) => void;
}

type Phase = 'playing' | 'results';

interface DecisionResult {
  isOptimal: boolean;
  ev: number;
}

export function FishTablesGame({ onComplete }: Props) {
  const [handIndex,   setHandIndex]   = useState(0);
  const [streetIndex, setStreetIndex] = useState(0);
  const [phase,       setPhase]       = useState<Phase>('playing');
  const [decision,    setDecision]    = useState<Decision | null>(null);
  const [showInsight, setShowInsight] = useState(false);
  const [showHint,    setShowHint]    = useState(false);
  const [betSize,     setBetSize]     = useState(24);
  const [results,     setResults]     = useState<DecisionResult[]>([]);

  // Random skins for Carl (picked once per game session)
  const carlChipSkin = useMemo(
    () => AVAILABLE_CHIP_SKINS[Math.floor(Math.random() * AVAILABLE_CHIP_SKINS.length)],
    [],
  );
  const carlCardSkin = useMemo(
    () => AVAILABLE_SKINS[Math.floor(Math.random() * AVAILABLE_SKINS.length)],
    [],
  );

  const { equippedChipSkin } = usePlayerStore();

  const currentHand   = HANDS[handIndex];
  const currentStreet = currentHand.streets[streetIndex];
  const totalHands    = HANDS.length;
  const totalStreets  = currentHand.streets.length;

  useEffect(() => {
    const minBet = currentStreet.oppBet > 0
      ? currentStreet.oppBet * 2
      : Math.round(currentStreet.pot * 0.5);
    setBetSize(Math.min(minBet, currentStreet.pot));
  }, [handIndex, streetIndex]);

  const handleDecision = (action: Decision) => {
    if (showInsight) return;
    const ev        = currentStreet.evTable[action];
    const isOptimal = action === currentStreet.optimalDecision;
    setDecision(action);
    setShowInsight(true);
    setResults((prev) => [...prev, { isOptimal, ev }]);
  };

  const handleAdvance = () => {
    setShowInsight(false);
    setDecision(null);
    setShowHint(false);
    if (decision === 'fold') { advanceHand(); return; }
    if (streetIndex < totalStreets - 1) {
      setStreetIndex(streetIndex + 1);
    } else {
      advanceHand();
    }
  };

  const advanceHand = () => {
    if (handIndex < totalHands - 1) {
      setHandIndex(handIndex + 1);
      setStreetIndex(0);
    } else {
      setPhase('results');
    }
  };

  const currentEV         = decision ? currentStreet.evTable[decision] : null;
  const isOptimalDecision = decision ? decision === currentStreet.optimalDecision : false;

  const isLastStreetOfLastHand = handIndex === totalHands - 1 && streetIndex === totalStreets - 1;
  const advanceLabel = decision === 'fold'
    ? 'Next Hand'
    : isLastStreetOfLastHand
    ? 'See Results'
    : streetIndex < totalStreets - 1
    ? 'Next Street →'
    : 'Next Hand →';

  if (phase === 'results') {
    const correct  = results.filter((r) => r.isOptimal).length;
    const accuracy = results.length > 0 ? Math.round((correct / results.length) * 100) : 0;
    const stars    = accuracy >= 80 ? 3 : accuracy >= 60 ? 2 : accuracy >= 40 ? 1 : 0;
    return (
      <div className="min-h-screen flex flex-col felt-dark-bg">
        <ResultsScreen results={results} onBack={() => onComplete(stars)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col felt-bg">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ background: '#0f2219', borderBottom: '3px solid rgba(0,0,0,0.5)' }}>
        <div className="flex items-center gap-2">
          <Fish className="w-4 h-4" style={{ color: '#ffb700' }} />
          <span className="font-pixel text-xs" style={{ color: '#ffb700' }}>FISH TABLES</span>
        </div>

        <div className="flex items-center gap-1.5">
          {HANDS.map((_, i) => (
            <div key={i} className="rounded transition-all"
              style={{
                width:  i === handIndex ? 20 : 8,
                height: 8,
                background: i < handIndex ? '#3a8a4a' : i === handIndex ? '#ffb700' : 'rgba(255,245,214,0.15)',
                border: `2px solid ${i === handIndex ? '#b88a00' : 'transparent'}`,
              }} />
          ))}
        </div>

        <span className="font-pixel text-[10px]" style={{ color: 'rgba(255,245,214,0.5)' }}>
          Hand {handIndex + 1}/{totalHands}
        </span>
      </div>

      {/* Opponent info strip */}
      <div className="flex items-center gap-3 px-4 py-2.5 shrink-0"
        style={{ background: '#160d05', borderBottom: '3px solid rgba(0,0,0,0.5)' }}>
        <div className="w-8 h-8 flex items-center justify-center text-lg shrink-0"
          style={{ background: '#1f1208', border: '2px solid #7a4f2a', borderRadius: 6, boxShadow: '2px 2px 0 #3a2010' }}>
          🐟
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-pixel text-xs" style={{ color: '#fff5d6' }}>Calling Carl</p>
          <p className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.4)' }}>
            Style: <span style={{ color: '#4a90e2' }}>Calling Station</span>
            <span className="mx-1">·</span>
            <span className="italic">"I always find a reason to call."</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <PokerChip skin={carlChipSkin} size={26} />
          <div className="text-right">
            <p className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.4)' }}>Stack</p>
            <p className="font-pixel text-xs" style={{ color: '#fff5d6' }}>100 BB</p>
          </div>
        </div>
      </div>

      {/* Hand title + street badges */}
      <div className="px-4 pt-3 pb-1 shrink-0">
        <div className="flex items-center justify-between">
          <p className="font-pixel text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,245,214,0.4)' }}>
            Hand {handIndex + 1}: {currentHand.title}
          </p>
          <div className="flex gap-1">
            {currentHand.streets.map((s, i) => (
              <span key={i} className="font-pixel text-[9px] px-2 py-0.5"
                style={{
                  background: i === streetIndex ? '#1f1208' : i < streetIndex ? '#0f2a18' : 'rgba(0,0,0,0.2)',
                  border: `2px solid ${i === streetIndex ? '#ffb700' : i < streetIndex ? '#1d5c2a' : 'rgba(0,0,0,0.3)'}`,
                  boxShadow: i === streetIndex ? '2px 2px 0 #8a6000' : 'none',
                  color: i === streetIndex ? '#ffb700' : i < streetIndex ? '#3a8a4a' : 'rgba(255,245,214,0.35)',
                  borderRadius: 4,
                }}>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Table area (felt) */}
      <div className="flex-1 flex flex-col items-center justify-between py-3 px-4 relative overflow-hidden">

        {/* Opponent zone */}
        <motion.div
          key={`opp-${handIndex}`}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-2 w-full"
        >
          <div className="w-full flex items-center justify-between px-4 py-2 rounded"
            style={{ background: 'rgba(0,0,0,0.25)', border: '2px solid rgba(0,0,0,0.3)', borderRadius: 8 }}>
            <div className="flex gap-1.5">
              <PlayingCard rank="?" suit="s" faceDown size="sm" skin={carlCardSkin} />
              <PlayingCard rank="?" suit="s" faceDown size="sm" skin={carlCardSkin} />
            </div>
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {currentStreet.oppBet > 0 && (
                  <motion.div
                    key={`carl-bet-${handIndex}-${streetIndex}`}
                    initial={{ scale: 0.3, x: 10, opacity: 0 }}
                    animate={{ scale: 1, x: 0, opacity: 1 }}
                    exit={{ scale: 0.3, x: 10, opacity: 0 }}
                    transition={{ type: 'spring', damping: 18, stiffness: 300 }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                    style={{
                      background: 'rgba(0,0,0,0.6)',
                      border: `1.5px solid ${carlChipSkin.chipBorder}`,
                      boxShadow: `1px 1px 0 ${carlChipSkin.chipShadow}`,
                    }}
                  >
                    <PokerChip skin={carlChipSkin} size={14} />
                    <span className="font-pixel text-[8px]" style={{ color: carlChipSkin.chipBorder }}>
                      +{currentStreet.oppBet}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="text-right">
                <p className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.4)' }}>Opponent</p>
                <p className="font-pixel text-sm" style={{ color: '#fff5d6' }}>
                  100 <TechTerm term="BB" definition="Big Blind: the standard betting unit in poker." />
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Community cards + pot */}
        <motion.div
          key={`board-${handIndex}-${streetIndex}`}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="px-4 py-1.5"
            style={{ background: '#160d05', border: '3px solid #7a4f2a', borderRadius: 6, boxShadow: '3px 3px 0 rgba(0,0,0,0.5)' }}>
            <span className="font-pixel text-sm" style={{ color: '#fff5d6' }}>
              Pot: {currentStreet.pot} <TechTerm term="BB" definition="Big Blind" />
            </span>
            {currentStreet.oppBet > 0 && (
              <span className="font-pixel text-xs ml-2" style={{ color: '#e63946' }}>
                · Carl bets {currentStreet.oppBet} BB
              </span>
            )}
          </div>

          <div className="flex justify-center gap-1.5">
            {currentStreet.communityCards.map((card, idx) => (
              <motion.div
                key={`${handIndex}-${streetIndex}-${idx}`}
                initial={{ scale: 0.7, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <PlayingCard rank={card.rank} suit={card.suit} size="md" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Hero hand */}
        <motion.div
          key={`hero-${handIndex}`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="relative flex justify-center" style={{ width: 120, height: 90 }}>
            <div className="absolute" style={{ transform: 'rotate(-6deg) translateX(-20px)', zIndex: 0 }}>
              <PlayingCard rank={currentHand.heroHand[0].rank} suit={currentHand.heroHand[0].suit} size="md" />
            </div>
            <div className="absolute" style={{ transform: 'rotate(6deg) translateX(20px)', zIndex: 1 }}>
              <PlayingCard rank={currentHand.heroHand[1].rank} suit={currentHand.heroHand[1].suit} size="md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PokerChip skin={equippedChipSkin} size={26} />
            <div className="px-3 py-1"
              style={{
                background: showInsight ? '#1f1208' : '#ffb700',
                border: `3px solid ${showInsight ? '#7a4f2a' : '#b88a00'}`,
                boxShadow: `3px 3px 0 ${showInsight ? '#3a2010' : '#8a6000'}`,
                borderRadius: 6,
              }}>
              <span className="font-pixel text-[10px]" style={{ color: showInsight ? 'rgba(255,245,214,0.4)' : '#1a0f08' }}>
                {showInsight ? 'Waiting...' : 'Your Action'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decision console */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.2 }}
        className="w-full p-3 pb-6 shrink-0"
        style={{ background: '#160d05', borderTop: '3px solid #7a4f2a' }}
      >
        <div className="max-w-lg mx-auto flex flex-col gap-2.5">
          {/* Hint toggle */}
          <div>
            <button
              onClick={() => setShowHint((v) => !v)}
              disabled={showInsight}
              className="flex items-center gap-1.5 px-3 py-1.5 disabled:opacity-40"
              style={{
                background: showHint ? '#1f1208' : 'transparent',
                border: `2px solid ${showHint ? '#7a4f2a' : 'rgba(255,245,214,0.12)'}`,
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <span className="text-sm">💡</span>
              <span className="font-pixel text-[9px]" style={{ color: showHint ? '#ffb700' : 'rgba(255,245,214,0.35)' }}>
                {showHint ? 'Hide hint' : 'Show hint'}
              </span>
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-1.5 px-3 py-2"
                    style={{ background: '#1f1208', border: '2px solid #7a4f2a', borderRadius: 6, boxShadow: '2px 2px 0 #3a2010' }}>
                    <p className="font-pixel text-[10px] leading-relaxed" style={{ color: 'rgba(255,245,214,0.6)' }}>
                      🎯 {currentStreet.narrative}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bet slider */}
          <div className="flex items-center gap-2 px-3 py-2"
            style={{ background: '#1f1208', border: '2px solid #7a4f2a', borderRadius: 6 }}>
            <span className="font-pixel text-[10px] shrink-0" style={{ color: 'rgba(255,245,214,0.4)' }}>
              {currentStreet.oppBet > 0 ? `${currentStreet.oppBet} BB` : '12 BB'}
            </span>
            <input
              type="range"
              min={currentStreet.oppBet > 0 ? currentStreet.oppBet * 2 : 12}
              max={currentStreet.pot * 2}
              value={betSize}
              onChange={(e) => setBetSize(Number(e.target.value))}
              className="flex-1"
              style={{ accentColor: '#ffb700', background: '#3a2010' }}
            />
            <span className="font-pixel text-[10px] shrink-0" style={{ color: '#ffb700' }}>{betSize} BB</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {currentStreet.oppBet > 0 ? (
              <>
                <button onClick={() => handleDecision('fold')} disabled={showInsight}
                  className="btn-balatro btn-red flex-1 py-3.5 cursor-pointer disabled:opacity-40">
                  Fold
                </button>
                <button onClick={() => handleDecision('call')} disabled={showInsight}
                  className="btn-balatro btn-blue flex-1 py-3.5 cursor-pointer disabled:opacity-40">
                  Call {currentStreet.oppBet}
                </button>
                <button onClick={() => handleDecision('raise')} disabled={showInsight}
                  className="btn-balatro btn-gold flex-1 py-3.5 cursor-pointer disabled:opacity-40">
                  Raise {betSize}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleDecision('call')} disabled={showInsight}
                  className="btn-balatro btn-dark flex-1 py-3.5 cursor-pointer disabled:opacity-40">
                  Check
                </button>
                <button onClick={() => handleDecision('raise')} disabled={showInsight}
                  className="btn-balatro btn-gold flex-[2] py-3.5 cursor-pointer disabled:opacity-40">
                  Bet {betSize} BB
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Insight overlay */}
      <AnimatePresence>
        {showInsight && decision && currentEV !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-30"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="absolute bottom-0 left-0 w-full z-40 p-5 pb-8"
              style={{ background: '#160d05', border: '3px solid #7a4f2a', borderBottom: 'none', borderRadius: '8px 8px 0 0', boxShadow: '0 -4px 0 rgba(0,0,0,0.5)' }}
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full mx-auto mb-4"
                style={{ background: '#7a4f2a' }} />

              {/* Result header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-pixel text-[9px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,245,214,0.4)' }}>
                    {currentStreet.label} Decision
                  </p>
                  <p className="font-pixel text-lg" style={{ color: isOptimalDecision ? '#3a8a4a' : '#e63946' }}>
                    {isOptimalDecision ? '✓ Optimal Play!' : '✗ Suboptimal'}
                  </p>
                  <p className="font-pixel text-[10px] mt-0.5" style={{ color: 'rgba(255,245,214,0.4)' }}>
                    You chose: <span style={{ color: '#fff5d6' }}>
                      {decision.charAt(0).toUpperCase() + decision.slice(1)}
                    </span>
                    {!isOptimalDecision && (
                      <> · Optimal: <span style={{ color: '#3a8a4a' }}>
                        {currentStreet.optimalDecision.charAt(0).toUpperCase() + currentStreet.optimalDecision.slice(1)}
                      </span></>
                    )}
                  </p>
                </div>
                <div className="px-4 py-2 text-right"
                  style={{
                    background: currentEV > 0 ? '#0f2a18' : '#2a0f0f',
                    border: `3px solid ${currentEV > 0 ? '#1d5c2a' : '#8a1920'}`,
                    boxShadow: `3px 3px 0 ${currentEV > 0 ? '#0a1a0f' : '#5a0a10'}`,
                    borderRadius: 6,
                  }}>
                  <p className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.4)' }}>EV</p>
                  <p className="font-pixel text-2xl leading-none" style={{ color: currentEV > 0 ? '#3a8a4a' : '#e63946' }}>
                    {currentEV > 0 ? '+' : ''}{currentEV.toFixed(1)}
                  </p>
                  <p className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.4)' }}>BB</p>
                </div>
              </div>

              {/* EV comparison */}
              <div className="p-3 mb-4"
                style={{ background: '#1f1208', border: '2px solid #7a4f2a', borderRadius: 6, boxShadow: '3px 3px 0 #3a2010' }}>
                <p className="font-pixel text-[9px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,245,214,0.4)' }}>
                  EV Comparison
                </p>
                <div className="flex gap-2">
                  {(['fold', 'call', 'raise'] as Decision[]).map((action) => {
                    const ev        = currentStreet.evTable[action];
                    const isChosen  = action === decision;
                    const isOptimal = action === currentStreet.optimalDecision;
                    return (
                      <div key={action} className="flex-1 py-2 text-center"
                        style={{
                          background: isChosen ? (isOptimal ? '#0f2a18' : '#2a0f0f') : '#160d05',
                          border: `2px solid ${isChosen ? (isOptimal ? '#3a8a4a' : '#cc2936') : isOptimal ? '#1d5c2a' : '#3a2010'}`,
                          boxShadow: isChosen ? '2px 2px 0 rgba(0,0,0,0.5)' : 'none',
                          borderRadius: 4,
                        }}>
                        <p className="font-pixel text-[9px] uppercase" style={{ color: 'rgba(255,245,214,0.4)' }}>{action}</p>
                        <p className="font-pixel text-sm"
                          style={{ color: ev > 0 ? '#4a90e2' : ev === 0 ? 'rgba(255,245,214,0.4)' : '#e63946' }}>
                          {ev > 0 ? '+' : ''}{ev.toFixed(1)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* GTO frequency bar */}
              <GtoBar
                fold={currentStreet.gtoFreq.fold}
                call={currentStreet.gtoFreq.call}
                raise={currentStreet.gtoFreq.raise}
                highlighted={currentStreet.optimalDecision}
              />

              {/* Advance button */}
              <button onClick={handleAdvance}
                className="btn-balatro btn-green w-full py-4 flex items-center justify-center gap-2 cursor-pointer">
                {advanceLabel}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
