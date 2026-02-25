import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronRight, ChevronDown, ChevronUp, X } from 'lucide-react';
import { PlayingCard } from '../../components/cards/PlayingCard';
import { TechTerm } from '../../components/ui/TechTerm';
import { ChipDisplay, PokerChip } from '../../components/ui/ChipDisplay';
import { useGameStore } from '../../store/gameStore';
import { usePlayerStore, AVAILABLE_CHIP_SKINS } from '../../store/playerStore';
import { TIER_SCENARIOS } from './scenarios';
import type { TierScenario } from './scenarios';
import type { Decision, Suit } from '../../types';

interface Props {
  onComplete: () => void;
}

// ── Tutorial overlay steps ────────────────────────────────────
interface TutorialStep {
  id: string;
  title: string;
  body: string;
  hint?: string;
  /** 'top' = overlay near top of table; 'bottom' = overlay from the bottom up */
  anchor: 'top' | 'bottom';
  /** Override the default bottom offset (px). Only used when anchor === 'bottom'. */
  bottomPx?: number;
  /** Which direction the arrow points (toward the focal element) */
  arrowUp: boolean;
  ctaLabel: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    // Hole cards at BOTTOM → overlay just above them, arrow ↓ toward cards below
    id: 'hole-cards',
    title: 'Your Hole Cards',
    body: 'These 2 private cards belong only to you — your opponent cannot see them.\n\nCombine them with the community cards on the board to make the best possible 5-card hand.',
    hint: 'Memorise your hole cards. They are your secret advantage!',
    anchor: 'bottom',
    bottomPx: 320,
    arrowUp: false,
    ctaLabel: 'Got it →',
  },
  {
    // Community cards in CENTRE → overlay at BOTTOM, arrow ↑ toward cards above
    id: 'community-cards',
    title: 'The Flop',
    body: 'Three community cards are now face-up in the centre of the table. Every player shares these cards.\n\nThis is the first of three rounds of community cards: Flop → Turn → River.',
    hint: 'After the Flop you can already see 5 of the 7 total cards available to you.',
    anchor: 'bottom',
    arrowUp: true,
    ctaLabel: 'Got it →',
  },
  {
    // Action bar at very BOTTOM → overlay just above it, arrow ↓ toward buttons below
    id: 'betting',
    title: 'Your Betting Options',
    body: 'It\'s your turn to act. You have three choices:\n\n• Fold — give up the hand, lose no more chips\n• Call — match your opponent\'s bet to stay in\n• Raise — increase the bet (for value or as a bluff)',
    hint: 'GTO poker mixes value raises and bluffs so opponents can\'t read you.',
    anchor: 'bottom',
    arrowUp: false,
    ctaLabel: 'Make my move →',
  },
];

export function ExampleHand({ onComplete }: Props) {
  const [tutorialStep, setTutorialStep] = useState(0);
  const tutorialActive = tutorialStep < TUTORIAL_STEPS.length;
  const currentTip = TUTORIAL_STEPS[tutorialStep];

  const {
    street, pot, oppBet, communityCards, betSize, showInsight, decision,
    setStreet, setPot, setOppBet, setCommunityCards, setBetSize, setShowInsight, setDecision,
    recordDecision, accuracy, correctDecisions, activeTier, activeExerciseIdx,
  } = useGameStore();
  const { addGold, addXP } = usePlayerStore();

  // The example exercise is always the first exercise in novice
  const allExercises = TIER_SCENARIOS['novice'];
  const raw = allExercises[activeExerciseIdx];
  const scenario = raw as TierScenario;

  const oppChipSkin = useMemo(
    () => AVAILABLE_CHIP_SKINS[Math.floor(Math.random() * AVAILABLE_CHIP_SKINS.length)],
    [],
  );

  // Init board from scenario on mount
  React.useEffect(() => {
    setCommunityCards(scenario.boardByStreet[0]);
    setPot(scenario.potByStreet[0]);
    setOppBet(scenario.oppBetByStreet[0]);
    setBetSize(scenario.betSizeByStreet[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const evData = useMemo(() => {
    if (!decision) return null;
    const ev = scenario.evTable[street]?.[decision] ?? 0;
    const isOptimal = scenario.optimal[street] === decision;
    return { ev, isOptimal };
  }, [decision, street, scenario]);

  const gtoFreq = scenario.gtoFreqByStreet[street] ?? { fold: 33, call: 34, raise: 33 };
  const insight = scenario.insightByStreet[street] ?? '';

  const handleDecision = (action: Decision) => {
    if (tutorialActive) return;
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
    const next = street + 1;
    setStreet(next);
    setCommunityCards(scenario.boardByStreet[next]);
    setPot(scenario.potByStreet[next]);
    setOppBet(scenario.oppBetByStreet[next]);
    setBetSize(scenario.betSizeByStreet[next]);
  };

  const chips = accuracy;
  const mult = Math.max(1, correctDecisions);

  return (
    <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden felt-bg">

      {/* Top bar */}
      <div
        className="flex items-center justify-between px-3 py-2 z-10 relative shrink-0"
        style={{ background: 'rgba(0,0,0,0.35)', borderBottom: '2px solid rgba(0,0,0,0.3)' }}
      >
        <div className="balatro-panel px-2 py-1.5 flex items-center gap-1.5"
          style={{ border: '2px solid #1a4d8a', boxShadow: '2px 2px 0 #123666' }}>
          <span className="font-pixel text-[9px]" style={{ color: '#4a90e2' }}>NOVICE · EXAMPLE</span>
        </div>
        <ChipDisplay chips={chips} mult={mult} />
        <div className="flex items-center gap-1">
          {scenario.streets.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <span className="font-pixel text-[9px] px-2 py-0.5 rounded"
                style={{
                  background: i === street ? '#4a90e2' : i < street ? '#2563eb' : 'rgba(0,0,0,0.4)',
                  color: i === street ? '#1a0f08' : '#fff5d6',
                  border: `2px solid ${i === street ? '#1a4d8a' : i < street ? '#1a4d8a' : 'rgba(255,255,255,0.1)'}`,
                }}>
                {s}
              </span>
              {i < scenario.streets.length - 1 && <ChevronRight className="w-2.5 h-2.5 text-white/20" />}
            </div>
          ))}
        </div>
      </div>

      {/* Scenario label */}
      <div className="px-3 py-2 text-center shrink-0"
        style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="font-pixel text-[10px]" style={{ color: '#4a90e2' }}>{scenario.handLabel}</p>
        <p className="font-pixel text-[8px] mt-0.5" style={{ color: 'rgba(255,245,214,0.35)' }}>{scenario.conceptNote}</p>
      </div>

      {/* Table */}
      <div className="flex-1 flex flex-col items-center justify-between py-5 px-4 z-10 relative">

        {/* Opponent */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center gap-2">
          <div className="balatro-panel px-5 py-2 flex flex-col items-center">
            <span className="font-pixel text-[10px] mb-1" style={{ color: 'rgba(255,245,214,0.5)' }}>Opponent</span>
            <div className="flex items-center gap-2">
              <PokerChip skin={oppChipSkin} size={26} />
              <span className="font-pixel text-xl" style={{ color: '#ffb700' }}>
                100 <TechTerm term="BB" definition="Big Blind: the basic unit of measurement in poker." />
              </span>
            </div>
            {oppBet > 0 && (
              <div className="flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(0,0,0,0.6)', border: `1.5px solid ${oppChipSkin.chipBorder}` }}>
                <PokerChip skin={oppChipSkin} size={12} />
                <span className="font-pixel text-[8px]" style={{ color: oppChipSkin.chipBorder }}>+{oppBet}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <PlayingCard rank="?" suit="s" faceDown size="sm" />
            <PlayingCard rank="?" suit="s" faceDown size="sm" />
          </div>
        </motion.div>

        {/* Community cards + pot */}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex flex-col items-center gap-3">
          <div className="balatro-panel px-4 py-1.5">
            <span className="font-pixel text-sm" style={{ color: '#fff5d6' }}>
              Pot: {pot} <TechTerm term="BB" definition="Big Blind" />
            </span>
          </div>
          <div className="flex justify-center gap-2">
            {communityCards.map((card, idx) => (
              <PlayingCard key={idx} rank={card.rank} suit={card.suit as Suit} size="md" animate />
            ))}
          </div>
        </motion.div>

        {/* Hero hole cards */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
          className="flex flex-col items-center gap-2">
          <div className="relative flex justify-center" style={{ width: 144, height: 112 }}>
            <div style={{ position: 'absolute', transform: 'rotate(-6deg) translateX(-20px)', zIndex: 0 }}>
              <PlayingCard rank={scenario.holeCards[0].rank} suit={scenario.holeCards[0].suit as Suit} size="md" />
            </div>
            <div style={{ position: 'absolute', transform: 'rotate(6deg) translateX(20px)', zIndex: 1 }}>
              <PlayingCard rank={scenario.holeCards[1].rank} suit={scenario.holeCards[1].suit as Suit} size="md" />
            </div>
          </div>
          <div className="balatro-panel px-3 py-1">
            <span className="font-pixel text-[9px]" style={{ color: tutorialActive ? '#4a90e2' : showInsight ? 'rgba(255,245,214,0.4)' : '#4a90e2' }}>
              {tutorialActive ? (tutorialStep < 2 ? 'Read the tips ↑' : 'Your Action') : showInsight ? 'Waiting...' : 'Your Action'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Decision console */}
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.3 }}
        className="w-full p-3 pb-safe z-20 relative shrink-0"
        style={{ background: '#0f2219', borderTop: '3px solid rgba(0,0,0,0.4)' }}>
        <div className="max-w-lg mx-auto flex flex-col gap-3">
          <div className="flex items-center gap-3 balatro-panel px-3 py-2">
            <span className="font-pixel text-xs" style={{ color: 'rgba(255,245,214,0.6)' }}>
              {oppBet > 0 ? oppBet : 12} BB
            </span>
            <input type="range" min={oppBet > 0 ? oppBet : 12} max={200} value={betSize}
              onChange={(e) => setBetSize(Number(e.target.value))}
              disabled={tutorialActive}
              className="flex-1"
              style={{ background: `linear-gradient(90deg, #4a90e2 ${((betSize - (oppBet || 12)) / (200 - (oppBet || 12))) * 100}%, #1d3a27 0%)`, opacity: tutorialActive ? 0.4 : 1 }} />
            <span className="font-pixel text-xs" style={{ color: '#4a90e2' }}>{betSize} BB</span>
          </div>
          <div className="flex gap-2">
            {oppBet > 0 ? (
              <>
                <button onClick={() => handleDecision('fold')} disabled={showInsight || tutorialActive}
                  className="flex-1 py-3.5 btn-balatro btn-red disabled:opacity-40">Fold</button>
                <button onClick={() => handleDecision('call')} disabled={showInsight || tutorialActive}
                  className="flex-1 py-3.5 btn-balatro btn-blue disabled:opacity-40">Call {oppBet}</button>
                <button onClick={() => handleDecision('raise')} disabled={showInsight || tutorialActive}
                  className="flex-1 py-3.5 btn-balatro btn-orange disabled:opacity-40">Raise {betSize}</button>
              </>
            ) : (
              <>
                <button onClick={() => handleDecision('call')} disabled={showInsight || tutorialActive}
                  className="flex-1 py-3.5 btn-balatro btn-dark disabled:opacity-40">Check</button>
                <button onClick={() => handleDecision('raise')} disabled={showInsight || tutorialActive}
                  className="flex-[2] py-3.5 btn-balatro btn-orange disabled:opacity-40">Bet {betSize} BB</button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Tutorial overlays ── */}
      <AnimatePresence>
        {tutorialActive && (
          <>
            {/* Dim layer */}
            <motion.div
              key="tutorial-dim"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 pointer-events-none"
              style={{ background: 'rgba(0,0,0,0.55)' }}
            />

            {/* Callout panel — positioned on the OPPOSITE side from the focal element */}
            <motion.div
              key={`tutorial-step-${tutorialStep}`}
              initial={{ opacity: 0, y: currentTip.anchor === 'top' ? -16 : 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="absolute left-3 right-3 z-40 rounded-2xl p-5"
              style={{
                ...(currentTip.anchor === 'top'
                  ? { top: 155 }
                  : { bottom: currentTip.bottomPx ?? 165 }),
                background: '#0f2219',
                border: '3px solid rgba(74,144,226,0.6)',
                boxShadow: '4px 4px 0 rgba(0,0,0,0.6), 0 0 24px rgba(74,144,226,0.2)',
              }}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  {TUTORIAL_STEPS.map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full"
                      style={{ background: i === tutorialStep ? '#4a90e2' : i < tutorialStep ? 'rgba(74,144,226,0.5)' : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
                <span className="font-pixel text-[8px]" style={{ color: 'rgba(255,245,214,0.3)' }}>
                  {tutorialStep + 1}/{TUTORIAL_STEPS.length}
                </span>
              </div>

              {/* Arrow points TOWARD the focal element */}
              <div className="flex justify-center mb-2">
                {currentTip.arrowUp
                  ? <ChevronUp   className="w-5 h-5 animate-bounce" style={{ color: '#4a90e2' }} strokeWidth={2.5} />
                  : <ChevronDown className="w-5 h-5 animate-bounce" style={{ color: '#4a90e2' }} strokeWidth={2.5} />
                }
              </div>

              {/* Content */}
              <h3 className="font-pixel text-sm mb-2" style={{ color: '#4a90e2' }}>
                {currentTip.title}
              </h3>

              {currentTip.body.split('\n').map((line, i) => (
                <p key={i} className="font-pixel text-[10px] leading-relaxed"
                  style={{ color: 'rgba(255,245,214,0.75)', marginTop: line === '' ? '0.4rem' : i === 0 ? 0 : '0.1rem' }}>
                  {line}
                </p>
              ))}

              {/* Hint */}
              {currentTip.hint && (
                <div className="mt-3 px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(255,183,0,0.08)', border: '1px solid rgba(255,183,0,0.2)' }}>
                  <p className="font-pixel text-[9px] leading-relaxed" style={{ color: 'rgba(255,245,214,0.55)' }}>
                    💡 {currentTip.hint}
                  </p>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={() => setTutorialStep((s) => s + 1)}
                className="w-full mt-4 py-3 btn-balatro btn-blue flex items-center justify-center gap-2"
              >
                {currentTip.ctaLabel}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Insight overlay (after decision) */}
      <AnimatePresence>
        {showInsight && evData && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-30"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="absolute bottom-0 left-0 w-full z-40 rounded-t-2xl p-5 pb-safe"
              style={{ background: '#0f2219', border: '3px solid rgba(0,0,0,0.5)', borderBottom: 'none' }}>
              <div className="max-w-lg mx-auto">
                <div className="w-10 h-1.5 rounded-full mx-auto mb-4" style={{ background: 'rgba(255,245,214,0.15)' }} />

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-pixel text-[10px] mb-1" style={{ color: 'rgba(255,245,214,0.5)' }}>
                      {scenario.streets[street]} Result
                    </p>
                    <p className="font-pixel text-base leading-none" style={{ color: evData.isOptimal ? '#3a8a4a' : '#cc2936' }}>
                      {evData.isOptimal ? '✓ Optimal Play!' : '✗ Suboptimal'}
                    </p>
                  </div>
                  <ChipDisplay chips={Math.round(Math.abs(evData.ev) * 100)} mult={evData.isOptimal ? 2 : 1} />
                </div>

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

                <div className="mb-4">
                  <div className="flex justify-between font-pixel text-[9px] mb-1">
                    <span style={{ color: '#e63946' }}>Fold {gtoFreq.fold}%</span>
                    <span style={{ color: '#ffb700' }}>Call {gtoFreq.call}%</span>
                    <span style={{ color: '#4a90e2' }}>Raise {gtoFreq.raise}%</span>
                  </div>
                  <div className="w-full h-4 flex rounded overflow-hidden" style={{ border: '2px solid rgba(0,0,0,0.4)' }}>
                    {gtoFreq.fold  > 0 && <div style={{ width: `${gtoFreq.fold}%`,  background: '#cc2936' }} />}
                    {gtoFreq.call  > 0 && <div style={{ width: `${gtoFreq.call}%`,  background: '#7a4f2a' }} />}
                    {gtoFreq.raise > 0 && <div style={{ width: `${gtoFreq.raise}%`, background: '#1a4d8a' }} />}
                  </div>
                </div>

                <button onClick={advanceStreet}
                  className="w-full py-3.5 btn-balatro btn-gold flex items-center justify-center gap-2">
                  {decision === 'fold' || street >= scenario.streets.length - 1 ? 'Finish Hand' : 'Next Street'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
