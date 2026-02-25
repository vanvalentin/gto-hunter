import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronRight, Shield, Swords, BookOpen, Crown, Flame, Trophy } from 'lucide-react';
import { CombinationsSheet } from './CombinationsSheet';
import { PlayingCard } from '../../components/cards/PlayingCard';
import { TechTerm } from '../../components/ui/TechTerm';
import { ChipDisplay, PokerChip } from '../../components/ui/ChipDisplay';
import { useGameStore } from '../../store/gameStore';
import { usePlayerStore, AVAILABLE_CHIP_SKINS } from '../../store/playerStore';
import { TIER_SCENARIOS } from './scenarios';
import type { TierScenario } from './scenarios';
import type { Decision, TierID } from '../../types';

interface Props {
  onAnalyzeRange: () => void;
  onComplete: () => void;
}

const TIER_COLORS: Record<TierID, { primary: string; border: string; shadow: string }> = {
  novice:       { primary: '#cd7f32', border: '#8a5200', shadow: '#5a3400' },
  beginner:     { primary: '#4ade80', border: '#15803d', shadow: '#0f6330' },
  intermediate: { primary: '#60a5fa', border: '#1a4d8a', shadow: '#123666' },
  expert:       { primary: '#c084fc', border: '#7e22ce', shadow: '#5b18a0' },
  legend:       { primary: '#ffb700', border: '#b88a00', shadow: '#8a6000' },
};

const TIER_ICONS: Record<TierID, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  novice:       Shield,
  beginner:     Swords,
  intermediate: BookOpen,
  expert:       Crown,
  legend:       Flame,
};

export function TacticalTable({ onAnalyzeRange, onComplete }: Props) {
  const [showCombinations, setShowCombinations] = useState(false);
  const {
    activeTier, activeExerciseIdx,
    street, pot, oppBet, communityCards, betSize, showInsight, decision,
    setStreet, setPot, setOppBet, setCommunityCards, setBetSize, setShowInsight, setDecision,
    recordDecision, accuracy, correctDecisions,
  } = useGameStore();
  const { addGold, addXP } = usePlayerStore();

  const allExercises = TIER_SCENARIOS[activeTier];
  const raw = allExercises[activeExerciseIdx] ?? allExercises.find((e) => e.type !== 'example');
  const scenario = raw as TierScenario;
  const tierColor = TIER_COLORS[activeTier];
  const TierIcon = TIER_ICONS[activeTier];

  // Init board from scenario on mount / tier change
  React.useEffect(() => {
    setCommunityCards(scenario.boardByStreet[0]);
    setPot(scenario.potByStreet[0]);
    setOppBet(scenario.oppBetByStreet[0]);
    setBetSize(scenario.betSizeByStreet[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTier]);

  const oppChipSkin = useMemo(
    () => AVAILABLE_CHIP_SKINS[Math.floor(Math.random() * AVAILABLE_CHIP_SKINS.length)],
    [],
  );

  const chips = accuracy;
  const mult = Math.max(1, correctDecisions);

  const evData = useMemo(() => {
    if (!decision) return null;
    const ev = scenario.evTable[street]?.[decision] ?? 0;
    const isOptimal = scenario.optimal[street] === decision;
    return { ev, isOptimal };
  }, [decision, street, scenario]);

  const handleDecision = (action: Decision) => {
    setDecision(action);
    setShowInsight(true);
    const ev = scenario.evTable[street]?.[action] ?? 0;
    const isOptimal = scenario.optimal[street] === action;
    recordDecision(isOptimal, ev);
    if (isOptimal) { addGold(10); addXP(25); }
  };

  const advanceStreet = () => {
    setShowInsight(false);
    setDecision(null);
    const totalStreets = scenario.streets.length;
    if (decision === 'fold' || street >= totalStreets - 1) {
      onComplete();
      return;
    }
    const nextStreet = street + 1;
    setStreet(nextStreet);
    setCommunityCards(scenario.boardByStreet[nextStreet]);
    setPot(scenario.potByStreet[nextStreet]);
    setOppBet(scenario.oppBetByStreet[nextStreet]);
    setBetSize(scenario.betSizeByStreet[nextStreet]);
  };

  const gtoFreq = scenario.gtoFreqByStreet[street] ?? { fold: 33, call: 34, raise: 33 };
  const insight = scenario.insightByStreet[street] ?? '';

  return (
    <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden felt-bg">

      {/* Top bar */}
      <div
        className="flex items-center justify-between px-3 py-2 z-10 relative shrink-0"
        style={{ background: 'rgba(0,0,0,0.35)', borderBottom: '2px solid rgba(0,0,0,0.3)' }}
      >
        {/* Tier badge */}
        <div
          className="balatro-panel px-2 py-1.5 flex items-center gap-1.5"
          style={{ border: `2px solid ${tierColor.border}`, boxShadow: `2px 2px 0 ${tierColor.shadow}` }}
        >
          <TierIcon className="w-3.5 h-3.5" style={{ color: tierColor.primary }} strokeWidth={2} />
          <span className="font-pixel text-[9px]" style={{ color: tierColor.primary }}>
            {activeTier.toUpperCase()} · #{activeExerciseIdx + 1}
          </span>
        </div>

        {/* Score */}
        <ChipDisplay chips={chips} mult={mult} />

        {/* Combinations button */}
        <button
          onClick={() => setShowCombinations(true)}
          className="balatro-panel px-2 py-1.5 flex items-center gap-1 btn-balatro btn-dark"
          style={{ border: '2px solid var(--panel-border)' }}
          title="Hand Rankings"
        >
          <Trophy className="w-3.5 h-3.5" style={{ color: '#ffb700' }} strokeWidth={2} />
          <span className="font-pixel text-[8px]" style={{ color: 'rgba(255,245,214,0.6)' }}>Hands</span>
        </button>

        {/* Street tracker */}
        <div className="flex items-center gap-1">
          {scenario.streets.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <span
                className="font-pixel text-[9px] px-2 py-0.5 rounded"
                style={{
                  background: i === street ? tierColor.primary : i < street ? '#2563eb' : 'rgba(0,0,0,0.4)',
                  color: i === street ? '#1a0f08' : '#fff5d6',
                  border: `2px solid ${i === street ? tierColor.border : i < street ? '#1a4d8a' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                {s}
              </span>
              {i < scenario.streets.length - 1 && <ChevronRight className="w-2.5 h-2.5 text-white/20" />}
            </div>
          ))}
        </div>
      </div>

      {/* Scenario label */}
      <div
        className="px-3 py-2 text-center shrink-0"
        style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <p className="font-pixel text-[10px]" style={{ color: tierColor.primary }}>{scenario.handLabel}</p>
        <p className="font-pixel text-[8px] mt-0.5" style={{ color: 'rgba(255,245,214,0.35)' }}>{scenario.conceptNote}</p>
      </div>

      {/* Table area */}
      <div className="flex-1 flex flex-col items-center justify-between py-5 px-4 z-10 relative">

        {/* Opponent zone */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center gap-2">
          <div className="balatro-panel px-5 py-2 flex flex-col items-center relative">
            {showInsight && (
              <div
                className="absolute -top-2 -right-2 w-4 h-4 rounded-full animate-pulse"
                style={{ background: tierColor.primary, border: `2px solid ${tierColor.border}`, boxShadow: `2px 2px 0 ${tierColor.shadow}` }}
              />
            )}
            <span className="font-pixel text-[10px] mb-1" style={{ color: 'rgba(255,245,214,0.5)' }}>Opponent</span>
            <div className="flex items-center gap-2">
              <PokerChip skin={oppChipSkin} size={26} />
              <span className="font-pixel text-xl" style={{ color: '#ffb700' }}>
                100 <TechTerm term="BB" definition="Big Blind: the basic unit of measurement in poker." />
              </span>
            </div>
            <AnimatePresence>
              {oppBet > 0 && (
                <motion.div
                  key={`opp-bet-${street}`}
                  initial={{ scale: 0.3, y: -6, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.3, y: -6, opacity: 0 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 300 }}
                  className="flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded"
                  style={{
                    background: 'rgba(0,0,0,0.6)',
                    border: `1.5px solid ${oppChipSkin.chipBorder}`,
                    boxShadow: `1px 1px 0 ${oppChipSkin.chipShadow}`,
                  }}
                >
                  <PokerChip skin={oppChipSkin} size={12} />
                  <span className="font-pixel text-[8px]" style={{ color: oppChipSkin.chipBorder }}>
                    +{oppBet}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex gap-2">
            <PlayingCard rank="?" suit="s" faceDown size="sm" />
            <PlayingCard rank="?" suit="s" faceDown size="sm" />
          </div>
        </motion.div>

        {/* Community cards + pot */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="balatro-panel px-4 py-1.5">
            <span className="font-pixel text-sm" style={{ color: '#fff5d6' }}>
              Pot: {pot} <TechTerm term="BB" definition="Big Blind" />
            </span>
          </div>
          <div className="flex justify-center gap-2">
            {communityCards.map((card, idx) => (
              <PlayingCard key={idx} rank={card.rank} suit={card.suit as any} size="md" animate />
            ))}
          </div>
        </motion.div>

        {/* Hero hand */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="relative flex justify-center" style={{ width: 144, height: 112 }}>
            <div style={{ position: 'absolute', transform: 'rotate(-6deg) translateX(-20px)', zIndex: 0 }}>
              <PlayingCard rank={scenario.holeCards[0].rank} suit={scenario.holeCards[0].suit as any} size="md" />
            </div>
            <div style={{ position: 'absolute', transform: 'rotate(6deg) translateX(20px)', zIndex: 1 }}>
              <PlayingCard rank={scenario.holeCards[1].rank} suit={scenario.holeCards[1].suit as any} size="md" />
            </div>
          </div>
          <div className="balatro-panel px-3 py-1">
            <span className="font-pixel text-[9px]" style={{ color: showInsight ? 'rgba(255,245,214,0.4)' : tierColor.primary }}>
              {showInsight ? 'Waiting...' : 'Your Action'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Decision console */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.3 }}
        className="w-full p-3 pb-safe z-20 relative shrink-0"
        style={{ background: '#0f2219', borderTop: '3px solid rgba(0,0,0,0.4)' }}
      >
        <div className="max-w-lg mx-auto flex flex-col gap-3">
          <div className="flex items-center gap-3 balatro-panel px-3 py-2">
            <span className="font-pixel text-xs" style={{ color: 'rgba(255,245,214,0.6)' }}>
              {oppBet > 0 ? oppBet : 12} BB
            </span>
            <input
              type="range"
              min={oppBet > 0 ? oppBet : 12}
              max={200}
              value={betSize}
              onChange={(e) => setBetSize(Number(e.target.value))}
              className="flex-1"
              style={{ background: `linear-gradient(90deg, ${tierColor.primary} ${((betSize - (oppBet || 12)) / (200 - (oppBet || 12))) * 100}%, #1d3a27 0%)` }}
            />
            <span className="font-pixel text-xs" style={{ color: tierColor.primary }}>{betSize} BB</span>
          </div>

          <div className="flex gap-2">
            {oppBet > 0 ? (
              <>
                <button onClick={() => handleDecision('fold')} disabled={showInsight}
                  className="flex-1 py-3.5 btn-balatro btn-red disabled:opacity-40">Fold</button>
                <button onClick={() => handleDecision('call')} disabled={showInsight}
                  className="flex-1 py-3.5 btn-balatro btn-blue disabled:opacity-40">
                  Call {oppBet}
                </button>
                <button onClick={() => handleDecision('raise')} disabled={showInsight}
                  className="flex-1 py-3.5 btn-balatro btn-orange disabled:opacity-40">
                  Raise {betSize}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleDecision('call')} disabled={showInsight}
                  className="flex-1 py-3.5 btn-balatro btn-dark disabled:opacity-40">Check</button>
                <button onClick={() => handleDecision('raise')} disabled={showInsight}
                  className="flex-[2] py-3.5 btn-balatro btn-orange disabled:opacity-40">
                  Bet {betSize} BB
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Combinations sheet */}
      <CombinationsSheet isOpen={showCombinations} onClose={() => setShowCombinations(false)} />

      {/* Insight overlay */}
      <AnimatePresence>
        {showInsight && evData && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-30"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="absolute bottom-0 left-0 w-full z-40 rounded-t-2xl p-5 pb-safe"
              style={{ background: '#0f2219', border: '3px solid rgba(0,0,0,0.5)', borderBottom: 'none' }}
            >
              <div className="max-w-lg mx-auto">
                <div className="w-10 h-1.5 rounded-full mx-auto mb-4" style={{ background: 'rgba(255,245,214,0.15)' }} />

                {/* Outcome + EV */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-pixel text-[10px] mb-1" style={{ color: 'rgba(255,245,214,0.5)' }}>
                      {scenario.streets[street]} Result
                    </p>
                    <p className="font-pixel text-base leading-none"
                      style={{ color: evData.isOptimal ? '#3a8a4a' : '#cc2936' }}>
                      {evData.isOptimal ? '✓ Optimal Play!' : '✗ Suboptimal'}
                    </p>
                  </div>
                  <ChipDisplay
                    chips={Math.round(Math.abs(evData.ev) * 100)}
                    mult={evData.isOptimal ? 2 : 1}
                  />
                </div>

                {/* EV value */}
                <div className="balatro-panel p-3 mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-pixel text-[10px]" style={{ color: 'rgba(255,245,214,0.5)' }}>EV</span>
                    <span className="font-pixel text-4xl" style={{ color: evData.ev > 0 ? '#4a90e2' : '#e63946' }}>
                      {evData.ev > 0 ? '+' : ''}{evData.ev.toFixed(1)}
                    </span>
                    <span className="font-pixel text-sm" style={{ color: 'rgba(255,245,214,0.5)' }}>BB</span>
                  </div>
                  <p className="font-pixel text-[9px] mt-1.5 leading-relaxed" style={{ color: 'rgba(255,245,214,0.55)' }}>
                    {insight}
                  </p>
                </div>

                {/* GTO frequency bar */}
                <div className="mb-4">
                  <div className="flex justify-between font-pixel text-[9px] mb-1">
                    <span style={{ color: '#e63946' }}>Fold {gtoFreq.fold}%</span>
                    <span style={{ color: '#ffb700' }}>Call {gtoFreq.call}%</span>
                    <span style={{ color: tierColor.primary }}>Raise {gtoFreq.raise}%</span>
                  </div>
                  <div className="w-full h-4 flex rounded overflow-hidden" style={{ border: '2px solid rgba(0,0,0,0.4)' }}>
                    {gtoFreq.fold > 0 && <div style={{ width: `${gtoFreq.fold}%`, background: '#cc2936' }} />}
                    {gtoFreq.call > 0 && <div style={{ width: `${gtoFreq.call}%`, background: '#7a4f2a' }} />}
                    {gtoFreq.raise > 0 && <div style={{ width: `${gtoFreq.raise}%`, background: tierColor.border }} />}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={onAnalyzeRange} className="flex-1 py-3.5 btn-balatro btn-dark">
                    Range
                  </button>
                  <button onClick={advanceStreet} className="flex-[2] py-3.5 btn-balatro btn-gold flex items-center justify-center gap-2">
                    {decision === 'fold' || street >= scenario.streets.length - 1 ? 'Finish Hand' : 'Next Street'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
