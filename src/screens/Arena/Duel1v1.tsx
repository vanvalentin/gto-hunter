import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock } from 'lucide-react';
import { PlayingCard } from '../../components/cards/PlayingCard';
import { TechTerm } from '../../components/ui/TechTerm';
import { PokerChip } from '../../components/ui/ChipDisplay';
import { usePlayerStore, AVAILABLE_CHIP_SKINS } from '../../store/playerStore';
import type { ArenaMember, Decision, MultiRoundResult, ArenaScenario, CardSkin, ChipSkin } from '../../types';
import { pickScenarios } from './scenarios';

const TOTAL_ROUNDS = 3;
const ROUND_TIMER = 20;

function EVBar({ playerEV, opponentEV }: { playerEV: number; opponentEV: number }) {
  const total = Math.abs(playerEV) + Math.abs(opponentEV);
  const playerPct = total > 0 ? (Math.abs(playerEV) / total) * 100 : 50;
  return (
    <div
      className="w-full h-3 flex overflow-hidden"
      style={{ background: '#0f2219', border: '2px solid #3a2010', borderRadius: 4 }}
    >
      <motion.div
        initial={{ width: '50%' }}
        animate={{ width: `${playerPct}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="h-full"
        style={{ background: '#2563eb' }}
      />
      <div className="h-full flex-1" style={{ background: '#cc2936' }} />
    </div>
  );
}

function ScoreDisplay({
  playerScore,
  opponentScore,
  opponentName,
  playerChipSkin,
  opponentChipSkin,
}: {
  playerScore: number;
  opponentScore: number;
  opponentName: string;
  playerChipSkin?: ChipSkin;
  opponentChipSkin?: ChipSkin;
}) {
  return (
    <div className="flex items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          {playerChipSkin && <PokerChip skin={playerChipSkin} size={18} />}
          <span className="font-pixel text-[9px] uppercase tracking-widest" style={{ color: '#4a90e2' }}>
            You
          </span>
        </div>
        <span
          className="font-pixel text-3xl leading-none"
          style={{ color: '#fff5d6', textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}
        >
          {playerScore}
        </span>
      </div>
      <span className="font-pixel text-xl" style={{ color: 'rgba(255,245,214,0.3)' }}>
        –
      </span>
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          {opponentChipSkin && <PokerChip skin={opponentChipSkin} size={18} />}
          <span className="font-pixel text-[9px] uppercase tracking-widest" style={{ color: '#e63946' }}>
            {opponentName}
          </span>
        </div>
        <span
          className="font-pixel text-3xl leading-none"
          style={{ color: '#fff5d6', textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}
        >
          {opponentScore}
        </span>
      </div>
    </div>
  );
}

type Phase = 'playing' | 'round_result' | 'final_result';

interface Props {
  playerName: string;
  playerAvatar: string;
  playerElo: number;
  equippedSkin: CardSkin;
  opponent: ArenaMember;
  onFinish: (won: boolean) => void;
}

export function Duel1v1({ playerName, playerAvatar, playerElo, equippedSkin, opponent, onFinish }: Props) {
  const [scenarios] = useState<ArenaScenario[]>(() => pickScenarios(TOTAL_ROUNDS));

  const { equippedChipSkin } = usePlayerStore();
  const opponentChipSkin = useMemo(
    () => AVAILABLE_CHIP_SKINS[Math.floor(Math.random() * AVAILABLE_CHIP_SKINS.length)],
    [],
  );
  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [decision, setDecision] = useState<Decision | null>(null);
  const [opponentDecided, setOpponentDecided] = useState(false);
  const [countdown, setCountdown] = useState(ROUND_TIMER);
  const [results, setResults] = useState<MultiRoundResult[]>([]);
  const [lastResult, setLastResult] = useState<MultiRoundResult | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const opponentRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = scenarios[currentRound];

  const clearTimers = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (opponentRef.current) clearTimeout(opponentRef.current);
  };

  useEffect(() => {
    setCountdown(ROUND_TIMER);
    setDecision(null);
    setOpponentDecided(false);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    opponentRef.current = setTimeout(
      () => setOpponentDecided(true),
      3000 + Math.random() * 7000,
    );

    return clearTimers;
  }, [currentRound]);

  const resolveRound = (d: Decision) => {
    clearTimers();
    setDecision(d);

    setTimeout(() => {
      const sc = scenarios[currentRound];
      const opponentMove: Decision = Math.random() > 0.4 ? 'call' : Math.random() > 0.5 ? 'raise' : 'fold';
      const playerEV = sc.evTable[d];
      const opponentEV = sc.evTable[opponentMove];
      const playerWon = playerEV > opponentEV;

      const result: MultiRoundResult = {
        round: currentRound + 1,
        scenario: sc,
        playerDecision: d,
        opponentDecision: opponentMove,
        playerEV,
        opponentEV,
        playerWon,
      };

      const newResults = [...results, result];
      setResults(newResults);
      setLastResult(result);

      const newPlayerScore = playerScore + (playerWon ? 1 : 0);
      const newOpponentScore = opponentScore + (playerWon ? 0 : 1);
      setPlayerScore(newPlayerScore);
      setOpponentScore(newOpponentScore);

      setPhase('round_result');
    }, 1000);
  };

  const advanceRound = () => {
    const nextRound = currentRound + 1;
    if (nextRound >= TOTAL_ROUNDS || playerScore >= 2 || opponentScore >= 2) {
      setPhase('final_result');
    } else {
      setCurrentRound(nextRound);
      setPhase('playing');
    }
  };

  const matchWon = playerScore > opponentScore;

  if (!scenario) return null;

  return (
    <div className="flex-1 flex flex-col">
      <AnimatePresence mode="wait">

        {/* ── PLAYING ── */}
        {phase === 'playing' && (
          <motion.div
            key={`playing-${currentRound}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex-1 flex flex-col felt-bg px-4 py-4 gap-4"
          >
            {/* Top bar: round indicator + score + timer */}
            <div className="flex items-center justify-between">
              <div
                className="px-2.5 py-1"
                style={{
                  background: '#1a0f00',
                  border: '2px solid #7a4f2a',
                  boxShadow: '2px 2px 0 #3a2010',
                  borderRadius: 6,
                }}
              >
                <span className="font-pixel text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,245,214,0.5)' }}>
                  Round {currentRound + 1}/{TOTAL_ROUNDS}
                </span>
              </div>

              <ScoreDisplay
                playerScore={playerScore}
                opponentScore={opponentScore}
                opponentName={opponent.name}
                playerChipSkin={equippedChipSkin}
                opponentChipSkin={opponentChipSkin}
              />

              <div
                className="flex items-center gap-1.5 px-2.5 py-1"
                style={{
                  background: countdown <= 5 ? '#2a0f0f' : '#1f1208',
                  border: `2px solid ${countdown <= 5 ? '#8a1920' : '#7a4f2a'}`,
                  boxShadow: `2px 2px 0 ${countdown <= 5 ? '#5a0a10' : '#3a2010'}`,
                  borderRadius: 6,
                }}
              >
                <Clock className="w-3.5 h-3.5" style={{ color: countdown <= 5 ? '#e63946' : 'rgba(255,245,214,0.5)' }} />
                <span className="font-pixel text-sm" style={{ color: countdown <= 5 ? '#e63946' : '#fff5d6' }}>
                  {countdown}s
                </span>
              </div>
            </div>

            {/* Scenario label */}
            <div className="flex items-center justify-between">
              <span
                className="font-pixel text-[9px] uppercase tracking-widest px-2 py-0.5"
                style={{
                  background: '#0f2a18',
                  border: '2px solid #1d5c2a',
                  boxShadow: '2px 2px 0 #0a1a0f',
                  borderRadius: 4,
                  color: '#3a8a4a',
                }}
              >
                {scenario.label}
              </span>
              <div className="flex items-center gap-2">
                {opponentDecided && (
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#3a8a4a' }} />
                )}
                <span className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.4)' }}>
                  {opponentDecided ? `${opponent.name} decided` : `${opponent.name} thinking...`}
                </span>
              </div>
            </div>

            {/* Community cards */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="px-4 py-1.5"
                style={{
                  background: '#160d05',
                  border: '3px solid #7a4f2a',
                  boxShadow: '3px 3px 0 rgba(0,0,0,0.5)',
                  borderRadius: 6,
                }}
              >
                <span className="font-pixel text-sm" style={{ color: '#fff5d6' }}>
                  Pot: {scenario.pot} <TechTerm term="BB" definition="Big Blind" />
                </span>
              </div>
              {scenario.communityCards.length > 0 ? (
                <div className="flex gap-2">
                  {scenario.communityCards.map((c, i) => (
                    <PlayingCard key={i} rank={c.rank} suit={c.suit} size="md" animate />
                  ))}
                </div>
              ) : (
                <div
                  className="px-6 py-3"
                  style={{
                    background: '#0f2219',
                    border: '2px dashed #1d5c2a',
                    borderRadius: 8,
                  }}
                >
                  <span className="font-pixel text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,245,214,0.3)' }}>
                    Preflop — No board
                  </span>
                </div>
              )}
            </div>

            {/* Hole cards */}
            <div className="relative flex justify-center w-36 h-28 mx-auto">
              <PlayingCard
                rank={scenario.holeCards[0].rank}
                suit={scenario.holeCards[0].suit}
                className="absolute transform -rotate-6 -translate-x-5 z-0"
                size="md"
                skin={equippedSkin}
              />
              <PlayingCard
                rank={scenario.holeCards[1].rank}
                suit={scenario.holeCards[1].suit}
                className="absolute transform rotate-6 translate-x-5 z-10"
                size="md"
                skin={equippedSkin}
              />
            </div>

            {/* Action buttons */}
            {!decision ? (
              <div className="mt-auto flex flex-col gap-2.5">
                <p
                  className="font-pixel text-[9px] text-center uppercase tracking-widest"
                  style={{ color: 'rgba(255,245,214,0.4)' }}
                >
                  Your Action
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => resolveRound('fold')}
                    className="btn-balatro btn-red flex-1 py-4 cursor-pointer"
                  >
                    Fold
                  </button>
                  <button
                    onClick={() => resolveRound('call')}
                    className="btn-balatro btn-dark flex-1 py-4 cursor-pointer"
                  >
                    Call {scenario.callAmount}
                  </button>
                  <button
                    onClick={() => resolveRound('raise')}
                    className="btn-balatro btn-gold flex-1 py-4 cursor-pointer"
                  >
                    Raise
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-auto flex flex-col items-center gap-3 py-4">
                <div
                  className="w-12 h-12 rounded-full animate-spin"
                  style={{ border: '3px solid rgba(255,183,0,0.2)', borderTopColor: '#ffb700' }}
                />
                <p className="font-pixel text-xs" style={{ color: 'rgba(255,245,214,0.4)' }}>
                  Comparing decisions...
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── ROUND RESULT ── */}
        {phase === 'round_result' && lastResult && (
          <motion.div
            key={`round-result-${currentRound}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex-1 flex flex-col justify-center px-4 gap-5"
          >
            {/* Round outcome badge */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 250 }}
                className="text-5xl mb-2"
              >
                {lastResult.playerWon ? '✅' : '❌'}
              </motion.div>
              <h3
                className="font-pixel text-2xl uppercase"
                style={{
                  color: lastResult.playerWon ? '#3a8a4a' : '#e63946',
                  textShadow: `2px 2px 0 ${lastResult.playerWon ? '#1d5c2a' : '#8a1920'}`,
                }}
              >
                {lastResult.playerWon ? 'Round Won' : 'Round Lost'}
              </h3>
              <p className="font-pixel text-[9px] mt-1 uppercase tracking-widest" style={{ color: 'rgba(255,245,214,0.4)' }}>
                {lastResult.scenario.label}
              </p>
            </div>

            {/* EV breakdown */}
            <div className="balatro-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-center flex-1">
                  <p className="font-pixel text-[10px] uppercase" style={{ color: '#4a90e2' }}>
                    {lastResult.playerDecision}
                  </p>
                  <p
                    className="font-pixel text-xl mt-1"
                    style={{ color: lastResult.playerEV >= 0 ? '#3a8a4a' : '#e63946' }}
                  >
                    {lastResult.playerEV > 0 ? '+' : ''}{lastResult.playerEV.toFixed(2)} BB
                  </p>
                </div>
                <div className="font-pixel text-sm px-2" style={{ color: 'rgba(255,245,214,0.3)' }}>
                  VS
                </div>
                <div className="text-center flex-1">
                  <p className="font-pixel text-[10px] uppercase" style={{ color: '#e63946' }}>
                    {lastResult.opponentDecision}
                  </p>
                  <p
                    className="font-pixel text-xl mt-1"
                    style={{ color: lastResult.opponentEV >= 0 ? '#3a8a4a' : '#e63946' }}
                  >
                    {lastResult.opponentEV > 0 ? '+' : ''}{lastResult.opponentEV.toFixed(2)} BB
                  </p>
                </div>
              </div>
              <EVBar playerEV={lastResult.playerEV} opponentEV={lastResult.opponentEV} />
              <div className="flex justify-between mt-1.5">
                <span className="font-pixel text-[9px]" style={{ color: '#4a90e2' }}>You</span>
                <span className="font-pixel text-[9px]" style={{ color: '#e63946' }}>{opponent.name}</span>
              </div>
            </div>

            {/* Running score */}
            <ScoreDisplay
              playerScore={playerScore}
              opponentScore={opponentScore}
              opponentName={opponent.name}
              playerChipSkin={equippedChipSkin}
              opponentChipSkin={opponentChipSkin}
            />

            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ x: 2, y: 2, boxShadow: 'none' }}
              onClick={advanceRound}
              className="btn-balatro btn-gold w-full py-4 cursor-pointer text-lg"
            >
              {currentRound + 1 >= TOTAL_ROUNDS || playerScore >= 2 || opponentScore >= 2
                ? 'See Final Result'
                : `Round ${currentRound + 2} →`}
            </motion.button>
          </motion.div>
        )}

        {/* ── FINAL RESULT ── */}
        {phase === 'final_result' && (
          <motion.div
            key="final-result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto pb-6 px-4 pt-6"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-6xl mb-3"
              >
                {matchWon ? '🏆' : '💀'}
              </motion.div>
              <h2
                className="font-pixel text-3xl uppercase"
                style={{
                  color: matchWon ? '#3a8a4a' : '#e63946',
                  textShadow: `3px 3px 0 ${matchWon ? '#1d5c2a' : '#8a1920'}`,
                }}
              >
                {matchWon ? 'Victory!' : 'Defeated'}
              </h2>
              <p className="font-pixel text-[10px] mt-2" style={{ color: 'rgba(255,245,214,0.4)' }}>
                {matchWon ? '+25 ELO · +75 🪙 · +150 XP' : '-20 ELO · +20 🪙 · +50 XP'}
              </p>
            </div>

            {/* Final score */}
            <div className="balatro-panel p-4 mb-4">
              <p
                className="font-pixel text-[9px] text-center uppercase tracking-widest mb-4"
                style={{ color: 'rgba(255,245,214,0.4)' }}
              >
                Final Score
              </p>
              <ScoreDisplay
                playerScore={playerScore}
                opponentScore={opponentScore}
                opponentName={opponent.name}
                playerChipSkin={equippedChipSkin}
                opponentChipSkin={opponentChipSkin}
              />
            </div>

            {/* Round-by-round breakdown */}
            <div className="balatro-panel overflow-hidden mb-4">
              <p
                className="font-pixel text-[9px] uppercase tracking-widest px-4 pt-3 pb-2"
                style={{ color: 'rgba(255,245,214,0.4)' }}
              >
                Round Breakdown
              </p>
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-2.5"
                  style={{ borderTop: i > 0 ? '2px solid rgba(0,0,0,0.4)' : 'none' }}
                >
                  <div
                    className="w-6 h-6 flex items-center justify-center font-pixel text-[9px] shrink-0"
                    style={{
                      background: r.playerWon ? '#3a8a4a' : '#cc2936',
                      border: `2px solid ${r.playerWon ? '#1d5c2a' : '#8a1920'}`,
                      boxShadow: `2px 2px 0 ${r.playerWon ? '#1d5c2a' : '#8a1920'}`,
                      borderRadius: 4,
                      color: 'white',
                    }}
                  >
                    {r.playerWon ? 'W' : 'L'}
                  </div>
                  <span className="font-pixel text-[9px] flex-1" style={{ color: 'rgba(255,245,214,0.6)' }}>
                    {r.scenario.label}
                  </span>
                  <span className="font-pixel text-[9px] uppercase" style={{ color: '#4a90e2' }}>
                    {r.playerDecision}
                  </span>
                  <span
                    className="font-pixel text-[9px]"
                    style={{ color: r.playerEV >= 0 ? '#3a8a4a' : '#e63946' }}
                  >
                    {r.playerEV > 0 ? '+' : ''}{r.playerEV.toFixed(2)} BB
                  </span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ x: 2, y: 2, boxShadow: 'none' }}
              onClick={() => onFinish(matchWon)}
              className="btn-balatro btn-gold w-full py-4 cursor-pointer"
            >
              Back to Arena
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
