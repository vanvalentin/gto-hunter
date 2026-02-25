import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayingCard } from '../../components/cards/PlayingCard';
import { PokerChip } from '../../components/ui/ChipDisplay';
import type { ArenaMode, PokerSeat, PokerGameState, PokerAction, Card, CardSkin, ChipSkin } from '../../types';
import { AVAILABLE_CHIP_SKINS, AVAILABLE_SKINS } from '../../store/playerStore';
import {
  createDeck, shuffle, dealCards, evaluateHand, compareHands,
  preflopStrength, generateAIAction, POKER3_ELO, POKER5_ELO,
} from '../../utils/poker';

// ── Constants ─────────────────────────────────────────────────────────────────

const SB = 10;
const BB = 20;
const STARTING_STACK = 1000;
const AI_DELAY_MS = 900;
const TURN_TIMER_S = 30;

const AI_NAMES_3 = ['PokerWolf99', 'AllInAnna'];
const AI_NAMES_5 = ['PokerWolf99', 'AllInAnna', 'GTO_God', 'TiltKing'];
const AI_AVATARS = [
  'https://picsum.photos/seed/wolf/100/100',
  'https://picsum.photos/seed/anna/100/100',
  'https://picsum.photos/seed/god/100/100',
  'https://picsum.photos/seed/tilt/100/100',
];

// ── Seat position layout ──────────────────────────────────────────────────────
// Seats are placed around the felt oval. The player (last seat) is always at
// the bottom-center. Positions use translate(-50%,-50%) so the anchor point
// is the centre of the seat element.

const SEAT_POSITIONS_3: Array<{ top: string; left: string; label: string }> = [
  { top: '18%', left: '22%', label: 'SB'  }, // upper-left
  { top: '18%', left: '78%', label: 'BB'  }, // upper-right
  { top: '76%', left: '50%', label: 'BTN' }, // bottom-center (player)
];

const SEAT_POSITIONS_5: Array<{ top: string; left: string; label: string }> = [
  { top: '14%', left: '22%', label: 'SB'  }, // upper-left
  { top: '6%',  left: '50%', label: 'BB'  }, // top-center
  { top: '14%', left: '78%', label: 'CO'  }, // upper-right
  { top: '50%', left: '84%', label: 'MP'  }, // right-middle
  { top: '76%', left: '50%', label: 'BTN' }, // bottom-center (player)
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomBotChipSkin(): string {
  return AVAILABLE_CHIP_SKINS[Math.floor(Math.random() * AVAILABLE_CHIP_SKINS.length)].id;
}

function randomBotCardSkin(): string {
  return AVAILABLE_SKINS[Math.floor(Math.random() * AVAILABLE_SKINS.length)].id;
}

function buildInitialSeats(
  playerCount: number,
  playerName: string,
  playerAvatar: string,
): PokerSeat[] {
  const seats: PokerSeat[] = [];
  const aiNames   = playerCount === 3 ? AI_NAMES_3 : AI_NAMES_5;
  const positions = playerCount === 3 ? SEAT_POSITIONS_3 : SEAT_POSITIONS_5;

  for (let i = 0; i < playerCount; i++) {
    const isPlayer = i === playerCount - 1;
    seats.push({
      id: i,
      name: isPlayer ? playerName : aiNames[i],
      avatar: isPlayer ? playerAvatar : AI_AVATARS[i],
      stack: STARTING_STACK,
      holeCards: [],
      bet: 0,
      folded: false,
      isAllIn: false,
      isPlayer,
      position: positions[i].label as PokerSeat['position'],
      chipSkinId: isPlayer ? undefined : randomBotChipSkin(),
      cardSkinId: isPlayer ? undefined : randomBotCardSkin(),
    });
  }
  return seats;
}

function totalPot(state: PokerGameState): number {
  return state.pots.reduce((s, p) => s + p.amount, 0) +
    state.seats.reduce((s, seat) => s + seat.bet, 0);
}

function activeSeatCount(seats: PokerSeat[]): number {
  return seats.filter((s) => !s.folded && !s.isAllIn).length;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SeatCard({
  seat,
  position,
  isActive,
  isDealer,
  showCards,
  equippedSkin,
  equippedChipSkin,
}: {
  seat: PokerSeat;
  position: { top: string; left: string; label: string };
  isActive: boolean;
  isDealer: boolean;
  showCards: boolean;
  equippedSkin?: CardSkin;
  equippedChipSkin?: ChipSkin;
}) {
  // Resolve card skin: player uses equipped skin, bots use their assigned skin
  const cardSkin = seat.isPlayer
    ? equippedSkin
    : (seat.cardSkinId ? AVAILABLE_SKINS.find((s) => s.id === seat.cardSkinId) : undefined);

  // Resolve chip skin: player uses equipped chip skin, bots use their assigned skin
  const chipSkin = seat.isPlayer
    ? equippedChipSkin
    : (seat.chipSkinId ? AVAILABLE_CHIP_SKINS.find((s) => s.id === seat.chipSkinId) : AVAILABLE_CHIP_SKINS[0]);

  const borderCol = seat.folded
    ? 'rgba(255,255,255,0.08)'
    : isActive
    ? '#ffb700'
    : seat.isPlayer
    ? '#4a90e2'
    : 'rgba(255,255,255,0.18)';

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ top: position.top, left: position.left, transform: 'translate(-50%, -50%)', zIndex: seat.isPlayer ? 2 : 1 }}
    >
      {/* Hole cards — shown above the info chip */}
      <div className="flex gap-0.5 mb-1">
        {seat.holeCards.length === 2 ? (
          seat.holeCards.map((card, ci) => (
            <PlayingCard
              key={ci}
              rank={card.rank}
              suit={card.suit}
              faceDown={!(seat.isPlayer || showCards)}
              size="sm"
              skin={cardSkin}
            />
          ))
        ) : (
          <>
            <div className="w-7 h-10 rounded-sm" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }} />
            <div className="w-7 h-10 rounded-sm" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </>
        )}
      </div>

      {/* Info chip */}
      <div
        className="relative flex items-center gap-1.5 px-2 py-1 rounded"
        style={{
          background: seat.folded ? 'rgba(0,0,0,0.55)' : isActive ? 'rgba(255,183,0,0.18)' : 'rgba(0,0,0,0.72)',
          border: `2px solid ${borderCol}`,
          boxShadow: isActive ? `0 0 8px rgba(255,183,0,0.4)` : 'none',
          opacity: seat.folded ? 0.5 : 1,
          minWidth: 72,
        }}
      >
        {/* Dealer button */}
        {isDealer && (
          <div
            className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full flex items-center justify-center font-pixel text-[8px] z-10"
            style={{ background: '#ffb700', color: '#1a0f00', border: '2px solid #8a6000', fontWeight: 'bold' }}
          >
            D
          </div>
        )}

        {/* PokerChip SVG badge */}
        {chipSkin && <PokerChip skin={chipSkin} size={22} />}

        <div className="flex flex-col">
          <span className="font-pixel text-[8px] leading-tight truncate max-w-[54px]"
            style={{ color: seat.isPlayer ? '#93c5fd' : '#fff5d6' }}>
            {seat.name}
          </span>
          <span className="font-pixel text-[9px] leading-tight" style={{ color: '#ffb700' }}>
            {seat.stack}
          </span>
          {seat.folded && (
            <span className="font-pixel text-[8px] leading-tight" style={{ color: '#f87171' }}>FOLD</span>
          )}
          {seat.isAllIn && !seat.folded && (
            <span className="font-pixel text-[8px] leading-tight" style={{ color: '#c084fc' }}>ALL IN</span>
          )}
        </div>
      </div>

      {/* Bet badge — slides in when bet is placed */}
      <AnimatePresence>
        {seat.bet > 0 && !seat.folded && (
          <motion.div
            key={seat.bet}
            initial={{ scale: 0.3, y: -8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.3, y: -8, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 300 }}
            className="flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(0,0,0,0.7)',
              border: `1.5px solid ${chipSkin?.chipBorder ?? '#4ade80'}`,
              boxShadow: `1px 1px 0 ${chipSkin?.chipShadow ?? '#15803d'}`,
            }}
          >
            {chipSkin && <PokerChip skin={chipSkin} size={14} />}
            <span className="font-pixel text-[8px]" style={{ color: chipSkin?.chipBorder ?? '#4ade80' }}>
              +{seat.bet}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  mode: ArenaMode;
  playerName: string;
  playerAvatar: string;
  equippedSkin?: CardSkin;
  equippedChipSkin?: ChipSkin;
  onFinish: (placement: number, eloDelta: number) => void;
}

export function PokerTable({ mode, playerName, playerAvatar, equippedSkin, equippedChipSkin, onFinish }: Props) {
  const playerCount = mode === 'poker3' ? 3 : 5;
  const maxHands    = mode === 'poker3' ? 10 : 15;
  const eloTable    = mode === 'poker3' ? POKER3_ELO : POKER5_ELO;
  const seatPositions = mode === 'poker3' ? SEAT_POSITIONS_3 : SEAT_POSITIONS_5;

  const [gs, setGs] = useState<PokerGameState>(() => initGame(playerCount, playerName, playerAvatar, maxHands));
  const [timer, setTimer]           = useState(TURN_TIMER_S);
  const [raiseAmount, setRaiseAmount] = useState(BB * 2);
  const [showResult, setShowResult]   = useState<null | { placement: number; eloDelta: number; chipChange: number }>(null);
  const [log, setLog]                 = useState<string[]>([]);
  const [showCards, setShowCards]     = useState(false);

  const gsRef   = useRef(gs);
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  gsRef.current = gs;

  // ── Game initialiser ──────────────────────────────────────────────────────

  function initGame(
    count: number,
    pName: string,
    pAvatar: string,
    hands: number,
  ): PokerGameState {
    return {
      street: 'preflop',
      communityCards: [],
      seats: buildInitialSeats(count, pName, pAvatar),
      pots: [],
      currentSeat: 0,
      dealerSeat: 0,
      handNumber: 0,
      maxHands: hands,
      phase: 'hand_over',
      minRaise: BB,
      lastRaise: BB,
    };
  }

  // ── Deal new hand ─────────────────────────────────────────────────────────

  const dealHand = useCallback((prev: PokerGameState): PokerGameState => {
    const alive = prev.seats.filter((s) => s.stack > 0);
    if (alive.length < 2) return { ...prev, phase: 'game_over' };

    const newDealerIdx = (prev.dealerSeat + 1) % prev.seats.length;
    let deck = shuffle(createDeck());

    const seats: PokerSeat[] = prev.seats.map((s) => {
      if (s.stack <= 0) return { ...s, folded: true, holeCards: [], bet: 0 };
      const { dealt, remaining } = dealCards(deck, 2);
      deck = remaining;
      return { ...s, folded: false, isAllIn: false, holeCards: dealt, bet: 0 };
    });

    const activeSeatIds = seats.filter((s) => !s.folded).map((s) => s.id);

    // Post blinds
    const sbIdx = activeSeatIds[(activeSeatIds.indexOf(newDealerIdx) + 1) % activeSeatIds.length];
    const bbIdx = activeSeatIds[(activeSeatIds.indexOf(sbIdx) + 1) % activeSeatIds.length];

    seats[sbIdx] = {
      ...seats[sbIdx],
      stack: seats[sbIdx].stack - Math.min(SB, seats[sbIdx].stack),
      bet: Math.min(SB, seats[sbIdx].stack),
    };
    seats[bbIdx] = {
      ...seats[bbIdx],
      stack: seats[bbIdx].stack - Math.min(BB, seats[bbIdx].stack),
      bet: Math.min(BB, seats[bbIdx].stack),
    };

    const firstToAct = activeSeatIds[(activeSeatIds.indexOf(bbIdx) + 1) % activeSeatIds.length];

    return {
      street: 'preflop',
      communityCards: [],
      seats,
      pots: [],
      currentSeat: firstToAct,
      dealerSeat: newDealerIdx,
      handNumber: prev.handNumber + 1,
      maxHands: prev.maxHands,
      phase: 'betting',
      minRaise: BB,
      lastRaise: BB,
      winners: undefined,
      lastAction: undefined,
    };
  }, []);

  // ── Collect bets into pot ─────────────────────────────────────────────────

  function collectBets(seats: PokerSeat[], prevPots: Array<{ amount: number; eligibleSeats: number[] }>) {
    const totalBet = seats.reduce((s, seat) => s + seat.bet, 0);
    const newSeats = seats.map((s) => ({ ...s, bet: 0 }));
    const eligibleSeats = seats.filter((s) => !s.folded).map((s) => s.id);
    const newPots = [...prevPots, { amount: totalBet, eligibleSeats }];
    return { newSeats, newPots };
  }

  // ── Advance street ────────────────────────────────────────────────────────

  function advanceStreet(prev: PokerGameState, deck: Card[]): PokerGameState {
    const { newSeats, newPots } = collectBets(prev.seats, prev.pots);

    const streets: Array<PokerGameState['street']> = ['preflop', 'flop', 'turn', 'river', 'showdown'];
    const nextStreet = streets[streets.indexOf(prev.street) + 1];

    let newCommunity = [...prev.communityCards];
    let remaining = deck;
    if (nextStreet === 'flop') {
      const { dealt, remaining: r } = dealCards(remaining, 3);
      newCommunity = dealt; remaining = r;
    } else if (nextStreet === 'turn' || nextStreet === 'river') {
      const { dealt, remaining: r } = dealCards(remaining, 1);
      newCommunity = [...newCommunity, ...dealt]; remaining = r;
    }

    const activeSeatIds = newSeats.filter((s) => !s.folded && !s.isAllIn).map((s) => s.id);
    const firstActive   = activeSeatIds.find((id) => id > prev.dealerSeat) ?? activeSeatIds[0];

    if (nextStreet === 'showdown' || activeSeatIds.length === 0) {
      return runShowdown({ ...prev, seats: newSeats, pots: newPots, communityCards: newCommunity });
    }

    return {
      ...prev,
      street: nextStreet,
      communityCards: newCommunity,
      seats: newSeats,
      pots: newPots,
      currentSeat: firstActive ?? 0,
      phase: 'betting',
      minRaise: BB,
      lastRaise: BB,
    };
  }

  // ── Showdown ──────────────────────────────────────────────────────────────

  function runShowdown(prev: PokerGameState): PokerGameState {
    const activeSeatIds = prev.seats.filter((s) => !s.folded).map((s) => s.id);

    let seats = prev.seats.map((s) => ({ ...s }));

    const winners: Array<{ seatId: number; amount: number; handName: string }> = [];
    for (const pot of [...prev.pots, { amount: 0, eligibleSeats: activeSeatIds }]) {
      if (pot.amount === 0) continue;
      const eligible = pot.eligibleSeats.filter((id) => !seats[id].folded);
      if (eligible.length === 0) continue;
      if (eligible.length === 1) {
        seats[eligible[0]].stack += pot.amount;
        winners.push({ seatId: eligible[0], amount: pot.amount, handName: 'Uncontested' });
        continue;
      }
      const evals = eligible.map((id) => ({
        id,
        ev: evaluateHand(seats[id].holeCards, prev.communityCards),
      }));
      evals.sort((a, b) => compareHands(b.ev, a.ev));
      const bestRank = evals[0].ev;
      const tied = evals.filter((e) => compareHands(e.ev, bestRank) === 0);
      const share = Math.floor(pot.amount / tied.length);
      for (const t of tied) {
        seats[t.id].stack += share;
        winners.push({ seatId: t.id, amount: share, handName: evals[0].ev.name });
      }
    }

    // Remaining bets (last street bets not yet collected)
    for (const s of prev.seats) {
      if (s.bet > 0) {
        seats[s.id].stack += s.bet;
        seats[s.id].bet = 0;
      }
    }

    return {
      ...prev,
      seats,
      phase: 'showdown',
      winners,
      street: 'showdown',
    };
  }

  // ── Apply player/AI action ────────────────────────────────────────────────

  const applyAction = useCallback((
    prev: PokerGameState,
    seatId: number,
    action: PokerAction,
    raiseAmt: number,
    deckRef: React.MutableRefObject<Card[]>,
  ): PokerGameState => {
    const seat   = prev.seats[seatId];
    let seats    = prev.seats.map((s) => ({ ...s }));
    const maxBet = Math.max(...seats.map((s) => s.bet));
    const toCall = maxBet - seat.bet;

    switch (action) {
      case 'fold':
        seats[seatId].folded = true;
        break;
      case 'check':
        break;
      case 'call': {
        const callAmt = Math.min(toCall, seat.stack);
        seats[seatId].stack -= callAmt;
        seats[seatId].bet   += callAmt;
        if (seats[seatId].stack === 0) seats[seatId].isAllIn = true;
        break;
      }
      case 'raise': {
        const totalBet = maxBet + raiseAmt;
        const put = Math.min(totalBet - seat.bet, seat.stack);
        seats[seatId].stack -= put;
        seats[seatId].bet   += put;
        if (seats[seatId].stack === 0) seats[seatId].isAllIn = true;
        break;
      }
      case 'all-in':
        seats[seatId].bet   += seat.stack;
        seats[seatId].stack  = 0;
        seats[seatId].isAllIn = true;
        break;
    }

    const active = seats.filter((s) => !s.folded && !s.isAllIn);
    if (active.length <= 1 || (active.length === 0)) {
      const newState = { ...prev, seats, lastAction: { seatId, action, amount: raiseAmt }, phase: 'showdown' as const };
      return runShowdown(newState);
    }

    // Check if betting round is complete
    const activeFull = seats.filter((s) => !s.folded && !s.isAllIn);
    const maxBetNow  = Math.max(...seats.filter((s) => !s.folded).map((s) => s.bet));
    const allCalled  = activeFull.every((s) => s.bet === maxBetNow || s.stack === 0);

    if (allCalled) {
      return advanceStreet({ ...prev, seats, lastAction: { seatId, action, amount: raiseAmt } }, deckRef.current);
    }

    // Next seat
    const activeIds = seats.filter((s) => !s.folded && !s.isAllIn).map((s) => s.id);
    const curIdx    = activeIds.indexOf(seatId);
    const nextSeat  = activeIds[(curIdx + 1) % activeIds.length];

    return {
      ...prev,
      seats,
      currentSeat: nextSeat,
      phase: 'betting',
      lastAction: { seatId, action, amount: raiseAmt },
      minRaise: action === 'raise' ? raiseAmt : prev.minRaise,
      lastRaise: action === 'raise' ? raiseAmt : prev.lastRaise,
    };
  }, []); // eslint-disable-line

  const deckRef = useRef<Card[]>([]);

  // ── Player action handler ─────────────────────────────────────────────────

  const handlePlayerAction = useCallback((action: PokerAction) => {
    setGs((prev) => {
      const playerSeat = prev.seats.find((s) => s.isPlayer);
      if (!playerSeat || prev.currentSeat !== playerSeat.id || prev.phase !== 'betting') return prev;
      return applyAction(prev, playerSeat.id, action, raiseAmount, deckRef);
    });
    setTimer(TURN_TIMER_S);
  }, [applyAction, raiseAmount]);

  // ── AI turn scheduler ─────────────────────────────────────────────────────

  useEffect(() => {
    if (gs.phase !== 'betting') return;
    const currentSeat = gs.seats[gs.currentSeat];
    if (!currentSeat || currentSeat.isPlayer || currentSeat.folded || currentSeat.isAllIn) return;

    if (aiTimer.current) clearTimeout(aiTimer.current);
    aiTimer.current = setTimeout(() => {
      setGs((prev) => {
        if (prev.phase !== 'betting') return prev;
        const seat = prev.seats[prev.currentSeat];
        if (!seat || seat.isPlayer || seat.folded || seat.isAllIn) return prev;

        const maxBet = Math.max(...prev.seats.filter((s) => !s.folded).map((s) => s.bet));
        const toCall = maxBet - seat.bet;
        const pot    = totalPot(prev);
        const hs     = preflopStrength(seat.holeCards);
        const isAgg  = seat.name === 'GTO_God' || seat.name === 'AllInAnna';
        const { action, amount } = generateAIAction(seat, hs, pot, toCall, prev.minRaise, isAgg);

        setLog((l) => [`${seat.name}: ${action}${amount ? ` ${amount}` : ''}`, ...l.slice(0, 4)]);
        return applyAction(prev, seat.id, action, amount, deckRef);
      });
    }, AI_DELAY_MS);

    return () => { if (aiTimer.current) clearTimeout(aiTimer.current); };
  }, [gs.phase, gs.currentSeat, applyAction]);

  // ── Auto-start next hand after showdown ───────────────────────────────────

  useEffect(() => {
    if (gs.phase !== 'showdown' && gs.phase !== 'hand_over') return;

    const playerSeat = gs.seats.find((s) => s.isPlayer);
    if (!playerSeat) return;

    const isGameOver = gs.handNumber >= gs.maxHands || gs.phase === 'game_over' ||
      (playerSeat.stack <= 0) ||
      (gs.seats.filter((s) => s.stack > 0).length < 2);

    if (gs.phase === 'showdown') {
      setShowCards(true);
      if (gs.winners) {
        const winnerNames = gs.winners.map((w) => {
          const s = gs.seats.find((seat) => seat.id === w.seatId);
          return `${s?.name ?? '?'} wins ${w.amount} (${w.handName})`;
        });
        setLog((l) => [...winnerNames, ...l.slice(0, 3)]);
      }

      const delay = isGameOver ? 2500 : 2000;
      const t = setTimeout(() => {
        setShowCards(false);
        if (isGameOver) {
          finishGame(gs);
        } else {
          setGs((prev) => ({ ...dealHand(prev), phase: 'betting' }));
        }
      }, delay);
      return () => clearTimeout(t);
    }

    if (gs.phase === 'hand_over' && gs.handNumber === 0) {
      const t = setTimeout(() => {
        setGs((prev) => dealHand(prev));
      }, 300);
      return () => clearTimeout(t);
    }
  }, [gs.phase, gs.handNumber, dealHand]); // eslint-disable-line

  function finishGame(state: PokerGameState) {
    const sortedByStack = [...state.seats].sort((a, b) => b.stack - a.stack);
    const playerSeat    = state.seats.find((s) => s.isPlayer)!;
    const placement     = sortedByStack.findIndex((s) => s.id === playerSeat.id) + 1;
    const eloDelta      = eloTable[placement] ?? -35;
    const chipChange    = playerSeat.stack - STARTING_STACK;
    setShowResult({ placement, eloDelta, chipChange });
  }

  // ── Timer countdown (player's turn) ──────────────────────────────────────

  useEffect(() => {
    if (gs.phase !== 'betting') return;
    const playerSeat = gs.seats.find((s) => s.isPlayer);
    if (!playerSeat || gs.currentSeat !== playerSeat.id) return;

    setTimer(TURN_TIMER_S);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          handlePlayerAction('fold');
          return TURN_TIMER_S;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gs.currentSeat, gs.phase, handlePlayerAction]);

  // ── Derived values ────────────────────────────────────────────────────────

  const playerSeat   = gs.seats.find((s) => s.isPlayer)!;
  const pot          = totalPot(gs);
  const maxBet       = Math.max(...gs.seats.filter((s) => !s.folded).map((s) => s.bet));
  const toCall       = playerSeat ? maxBet - playerSeat.bet : 0;
  const isPlayerTurn = gs.phase === 'betting' && playerSeat && gs.currentSeat === playerSeat.id;
  const canCheck     = toCall === 0;
  const minRaise     = Math.max(gs.minRaise, BB);
  const maxRaise     = playerSeat?.stack ?? 0;

  const handProgress = `${gs.handNumber} / ${gs.maxHands}`;

  // ── Result screen ─────────────────────────────────────────────────────────

  if (showResult) {
    const { placement, eloDelta, chipChange } = showResult;
    const isFirst = placement === 1;
    const medal   = placement === 1 ? '🏆' : placement === 2 ? '🥈' : placement === 3 ? '🥉' : '💀';
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
          className="text-7xl">{medal}</motion.div>
        <div className="text-center">
          <h2 className="font-pixel text-3xl uppercase"
            style={{ color: isFirst ? '#ffb700' : placement <= 2 ? '#3a8a4a' : '#e63946', textShadow: '3px 3px 0 rgba(0,0,0,0.5)' }}>
            {placement === 1 ? 'Champion!' : placement === 2 ? '2nd Place' : placement === 3 ? '3rd Place' : `${placement}th Place`}
          </h2>
          <p className="font-pixel text-xs mt-2" style={{ color: 'rgba(255,245,214,0.5)' }}>
            Final standing out of {playerCount} players
          </p>
        </div>
        <div className="balatro-panel p-4 w-full max-w-xs flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="font-pixel text-xs" style={{ color: 'rgba(255,245,214,0.5)' }}>ELO</span>
            <span className="font-pixel text-sm" style={{ color: eloDelta >= 0 ? '#3a8a4a' : '#e63946' }}>
              {eloDelta >= 0 ? '+' : ''}{eloDelta}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-pixel text-xs" style={{ color: 'rgba(255,245,214,0.5)' }}>Chips</span>
            <span className="font-pixel text-sm" style={{ color: chipChange >= 0 ? '#3a8a4a' : '#e63946' }}>
              {chipChange >= 0 ? '+' : ''}{chipChange}
            </span>
          </div>
        </div>
        <motion.button
          whileHover={{ x: 2 }} whileTap={{ x: 2, y: 2 }}
          onClick={() => onFinish(placement, eloDelta)}
          className="btn-balatro btn-gold px-10 py-4 cursor-pointer"
        >
          Back to Lobby
        </motion.button>
      </div>
    );
  }

  // ── Table UI ──────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '2px solid rgba(0,0,0,0.4)' }}>
        <span className="font-pixel text-xs" style={{ color: 'rgba(255,245,214,0.4)' }}>
          Hand {handProgress}
        </span>
        <span className="font-pixel text-sm" style={{ color: '#ffb700' }}>
          Pot: {pot}
        </span>
        <span className="font-pixel text-xs" style={{ color: 'rgba(255,245,214,0.4)' }}>
          {gs.street.toUpperCase()}
        </span>
      </div>

      {/* Table area */}
      <div className="relative flex-1" style={{ minHeight: 300 }}>
        {/* Felt oval — fills most of the area, player seat sits on the bottom edge */}
        <div
          className="absolute"
          style={{
            top: '4%', left: '6%', right: '6%', bottom: '18%',
            background: 'radial-gradient(ellipse at 50% 45%, #1f6b32 55%, #0f3a1a)',
            border: '5px solid #0a2510',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.45), 0 5px 0 #071a0a',
            borderRadius: '50%',
          }}
        />
        {/* Inner oval rail */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '7%', left: '9%', right: '9%', bottom: '21%',
            border: '2px solid rgba(255,255,255,0.06)',
            borderRadius: '50%',
          }}
        />

        {/* Community cards — centred vertically in the oval */}
        <div
          className="absolute flex gap-1 items-center justify-center"
          style={{ top: '42%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <AnimatePresence key={i}>
              {gs.communityCards[i] ? (
                <motion.div key={`${gs.communityCards[i].rank}${gs.communityCards[i].suit}`}
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}>
                  <PlayingCard rank={gs.communityCards[i].rank} suit={gs.communityCards[i].suit} size="sm" />
                </motion.div>
              ) : (
                <div key={`empty-${i}`} className="w-8 h-11 rounded"
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.1)' }} />
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Seats */}
        {gs.seats.map((seat, i) => (
          <SeatCard
            key={seat.id}
            seat={seat}
            position={seatPositions[i]}
            isActive={gs.phase === 'betting' && gs.currentSeat === seat.id}
            isDealer={gs.dealerSeat === seat.id}
            showCards={showCards}
            equippedSkin={equippedSkin}
            equippedChipSkin={equippedChipSkin}
          />
        ))}

        {/* Action log — pinned above the bottom of the table area */}
        <div className="absolute left-0 right-0" style={{ bottom: '1%' }}>
          {log.slice(0, 1).map((entry, i) => (
            <p key={i} className="font-pixel text-[8px] text-center"
              style={{ color: 'rgba(255,245,214,0.3)', lineHeight: 1.4 }}>{entry}</p>
          ))}
        </div>
      </div>

      {/* Player action panel */}
      <div className="shrink-0 px-3 pt-2 pb-3"
        style={{ background: 'rgba(0,0,0,0.7)', borderTop: '2px solid rgba(255,255,255,0.06)' }}>

        {isPlayerTurn ? (
          <div className="flex flex-col gap-2">
            {/* Timer bar */}
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: timer > 10 ? '#22c55e' : '#e63946' }}
                animate={{ width: `${(timer / TURN_TIMER_S) * 100}%` }}
                transition={{ duration: 0.9, ease: 'linear' }}
              />
            </div>

            {/* Raise slider */}
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[9px] shrink-0" style={{ color: 'rgba(255,245,214,0.4)' }}>
                Raise
              </span>
              <input
                type="range"
                min={minRaise}
                max={maxRaise}
                step={BB}
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(Number(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#ffb700' }}
              />
              <span className="font-pixel text-xs shrink-0" style={{ color: '#ffb700', minWidth: 28, textAlign: 'right' }}>
                {raiseAmount}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handlePlayerAction('fold')}
                className="btn-balatro btn-red flex-1 py-3 cursor-pointer font-pixel text-xs"
              >
                Fold
              </button>
              <button
                onClick={() => handlePlayerAction(canCheck ? 'check' : 'call')}
                className="btn-balatro btn-dark flex-1 py-3 cursor-pointer font-pixel text-xs"
              >
                {canCheck ? 'Check' : `Call ${toCall}`}
              </button>
              <button
                onClick={() => handlePlayerAction(raiseAmount >= maxRaise ? 'all-in' : 'raise')}
                className="btn-balatro btn-gold flex-[1.4] py-3 cursor-pointer font-pixel text-xs"
                disabled={maxRaise === 0}
              >
                {raiseAmount >= maxRaise ? 'All In' : `Raise ${raiseAmount}`}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="font-pixel text-xs" style={{ color: 'rgba(255,245,214,0.35)' }}>
              {gs.phase === 'showdown'  ? 'Showdown...' :
               gs.phase === 'dealing'   ? 'Dealing...' :
               gs.phase === 'hand_over' ? 'Next hand starting...' :
               playerSeat?.folded       ? 'You folded — watching...' :
               'Waiting for opponents...'}
            </p>
          </div>
        )}

        {/* Stack / pot summary */}
        <div className="flex items-center justify-between mt-1.5 pt-1.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.3)' }}>Your stack</span>
          <span className="font-pixel text-sm" style={{ color: playerSeat?.stack === 0 ? '#f87171' : '#ffb700' }}>
            {playerSeat?.stack ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}
