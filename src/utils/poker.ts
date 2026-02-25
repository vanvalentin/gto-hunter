import type { Card, Suit, Rank, PokerSeat, PokerAction } from '../types';

const SUITS: Suit[] = ['s', 'h', 'c', 'd'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

const RANK_VALUE: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function shuffle(deck: Card[]): Card[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

export function dealCards(deck: Card[], count: number): { dealt: Card[]; remaining: Card[] } {
  return { dealt: deck.slice(0, count), remaining: deck.slice(count) };
}

// ── Hand Evaluation ──────────────────────────────────────────────────────────

export interface HandEvaluation {
  rank: number;       // 0=high card .. 8=straight flush / royal flush
  value: number;      // tiebreaker as a single comparable number
  name: string;
}

const HAND_NAMES = [
  'High Card', 'One Pair', 'Two Pair', 'Three of a Kind',
  'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush',
];

function cardValue(card: Card): number {
  return RANK_VALUE[card.rank] ?? 0;
}

function getCombinations(arr: Card[], k: number): Card[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map((c) => [first, ...c]);
  const withoutFirst = getCombinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

function evaluate5(cards: Card[]): HandEvaluation {
  const vals = cards.map(cardValue).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);
  const isFlush = suits.every((s) => s === suits[0]);
  const isStraight = (() => {
    if (vals[0] - vals[4] === 4 && new Set(vals).size === 5) return true;
    // Wheel: A-2-3-4-5
    if (vals[0] === 14 && vals[1] === 5 && vals[2] === 4 && vals[3] === 3 && vals[4] === 2) return true;
    return false;
  })();
  const isWheel = vals[0] === 14 && vals[1] === 5;

  const counts = new Map<number, number>();
  vals.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const groupCounts = groups.map((g) => g[1]);
  const groupVals  = groups.map((g) => g[0]);

  const tieVal = (rankArr: number[]) =>
    rankArr.reduce((acc, v, i) => acc + v * Math.pow(15, 4 - i), 0);

  if (isFlush && isStraight) {
    const topVal = isWheel ? 5 : vals[0];
    return { rank: 8, value: tieVal([topVal]), name: 'Straight Flush' };
  }
  if (groupCounts[0] === 4) {
    return { rank: 7, value: tieVal([groupVals[0], groupVals[1]]), name: 'Four of a Kind' };
  }
  if (groupCounts[0] === 3 && groupCounts[1] === 2) {
    return { rank: 6, value: tieVal([groupVals[0], groupVals[1]]), name: 'Full House' };
  }
  if (isFlush) {
    return { rank: 5, value: tieVal(vals), name: 'Flush' };
  }
  if (isStraight) {
    const topVal = isWheel ? 5 : vals[0];
    return { rank: 4, value: tieVal([topVal]), name: 'Straight' };
  }
  if (groupCounts[0] === 3) {
    const kickers = groupVals.slice(1).sort((a, b) => b - a);
    return { rank: 3, value: tieVal([groupVals[0], ...kickers]), name: 'Three of a Kind' };
  }
  if (groupCounts[0] === 2 && groupCounts[1] === 2) {
    const pairs = [groupVals[0], groupVals[1]].sort((a, b) => b - a);
    return { rank: 2, value: tieVal([pairs[0], pairs[1], groupVals[2]]), name: 'Two Pair' };
  }
  if (groupCounts[0] === 2) {
    const kickers = groupVals.slice(1).sort((a, b) => b - a);
    return { rank: 1, value: tieVal([groupVals[0], ...kickers]), name: 'One Pair' };
  }
  return { rank: 0, value: tieVal(vals), name: 'High Card' };
}

export function evaluateHand(holeCards: Card[], communityCards: Card[]): HandEvaluation {
  const all = [...holeCards, ...communityCards];
  if (all.length < 5) {
    const vals = all.map(cardValue).sort((a, b) => b - a);
    return { rank: 0, value: vals.reduce((a, v, i) => a + v * Math.pow(15, 4 - i), 0), name: 'High Card' };
  }
  const combos = getCombinations(all, 5);
  let best: HandEvaluation = { rank: -1, value: -1, name: '' };
  for (const combo of combos) {
    const ev = evaluate5(combo);
    if (ev.rank > best.rank || (ev.rank === best.rank && ev.value > best.value)) {
      best = ev;
    }
  }
  return best;
}

export function compareHands(a: HandEvaluation, b: HandEvaluation): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  return a.value - b.value;
}

// ── Pre-flop hand strength (0–1) ─────────────────────────────────────────────

export function preflopStrength(holeCards: Card[]): number {
  if (holeCards.length < 2) return 0;
  const [a, b] = holeCards.map(cardValue).sort((x, y) => y - x);
  const suited = holeCards[0].suit === holeCards[1].suit;
  const isPair = a === b;
  const gap = a - b;

  if (isPair) {
    if (a >= 13) return 1.0;
    if (a >= 10) return 0.85;
    if (a >= 7)  return 0.65;
    return 0.45;
  }
  const base = (a + b) / 28;
  const suitedBonus = suited ? 0.05 : 0;
  const gapPenalty  = gap > 4 ? 0.15 : gap * 0.02;
  return Math.min(0.95, Math.max(0.05, base + suitedBonus - gapPenalty));
}

// ── AI Action Generator ───────────────────────────────────────────────────────

export function generateAIAction(
  seat: PokerSeat,
  handStrength: number,
  pot: number,
  callAmount: number,
  minRaise: number,
  isAggressive: boolean,
): { action: PokerAction; amount: number } {
  const canCheck = callAmount === 0;
  const aggFactor = isAggressive ? 0.12 : 0;
  const r = Math.random();

  if (callAmount >= seat.stack) {
    if (handStrength > 0.7 + aggFactor) return { action: 'all-in', amount: seat.stack };
    return { action: 'fold', amount: 0 };
  }

  if (handStrength > 0.85 + aggFactor) {
    const raiseAmt = Math.min(seat.stack, Math.max(minRaise, Math.floor(pot * (0.75 + r * 0.5))));
    return { action: 'raise', amount: raiseAmt };
  }
  if (handStrength > 0.65 + aggFactor) {
    if (canCheck) {
      if (r < 0.4) {
        const raiseAmt = Math.min(seat.stack, Math.max(minRaise, Math.floor(pot * 0.5)));
        return { action: 'raise', amount: raiseAmt };
      }
      return { action: 'check', amount: 0 };
    }
    if (callAmount <= pot * 0.4) return { action: 'call', amount: callAmount };
    if (r < 0.25) return { action: 'fold', amount: 0 };
    return { action: 'call', amount: callAmount };
  }
  if (handStrength > 0.4) {
    if (canCheck) return { action: 'check', amount: 0 };
    if (callAmount <= pot * 0.25) return { action: 'call', amount: callAmount };
    return { action: 'fold', amount: 0 };
  }
  if (canCheck) return { action: 'check', amount: 0 };
  return { action: 'fold', amount: 0 };
}

// ── ELO delta tables ──────────────────────────────────────────────────────────

export const POKER3_ELO: Record<number, number> = { 1: 40, 2: 0, 3: -25 };
export const POKER5_ELO: Record<number, number> = { 1: 60, 2: 20, 3: 0, 4: -20, 5: -35 };
