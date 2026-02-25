import type { ArenaScenario } from '../../types';

export const ARENA_SCENARIOS: ArenaScenario[] = [
  {
    id: 'flop-toppair',
    label: 'Flop · Top Pair',
    communityCards: [
      { rank: 'K', suit: 's' },
      { rank: '10', suit: 'h' },
      { rank: '4', suit: 'c' },
    ],
    holeCards: [
      { rank: 'A', suit: 'h' },
      { rank: 'K', suit: 'h' },
    ],
    pot: 24,
    callAmount: 12,
    evTable: { call: 2.15, raise: 3.40, fold: -1.20 },
  },
  {
    id: 'preflop-3bet',
    label: 'Preflop · 3-Bet Pot',
    communityCards: [],
    holeCards: [
      { rank: 'Q', suit: 'd' },
      { rank: 'Q', suit: 'c' },
    ],
    pot: 18,
    callAmount: 9,
    evTable: { raise: 4.80, call: 2.10, fold: -0.50 },
  },
  {
    id: 'turn-draw',
    label: 'Turn · Flush Draw',
    communityCards: [
      { rank: 'J', suit: 'h' },
      { rank: '9', suit: 'h' },
      { rank: '3', suit: 'd' },
      { rank: '2', suit: 'h' },
    ],
    holeCards: [
      { rank: 'A', suit: 'h' },
      { rank: '5', suit: 'h' },
    ],
    pot: 38,
    callAmount: 20,
    evTable: { raise: 1.80, call: 0.95, fold: -1.00 },
  },
  {
    id: 'river-valuebet',
    label: 'River · Value Bet',
    communityCards: [
      { rank: 'Q', suit: 's' },
      { rank: '7', suit: 'c' },
      { rank: '3', suit: 'h' },
      { rank: 'K', suit: 'd' },
      { rank: '2', suit: 's' },
    ],
    holeCards: [
      { rank: 'A', suit: 's' },
      { rank: 'K', suit: 's' },
    ],
    pot: 55,
    callAmount: 28,
    evTable: { raise: 5.20, call: 3.10, fold: -0.80 },
  },
  {
    id: 'flop-openender',
    label: 'Flop · Open-Ender',
    communityCards: [
      { rank: '8', suit: 'd' },
      { rank: '7', suit: 'c' },
      { rank: '2', suit: 's' },
    ],
    holeCards: [
      { rank: '9', suit: 'h' },
      { rank: '6', suit: 'h' },
    ],
    pot: 20,
    callAmount: 10,
    evTable: { raise: 1.30, call: 0.75, fold: -0.60 },
  },
  {
    id: 'preflop-squeeze',
    label: 'Preflop · Squeeze Spot',
    communityCards: [],
    holeCards: [
      { rank: 'A', suit: 'c' },
      { rank: 'K', suit: 'd' },
    ],
    pot: 22,
    callAmount: 11,
    evTable: { raise: 6.50, call: 2.80, fold: -0.30 },
  },
  {
    id: 'flop-cbet-dry',
    label: 'Flop · Dry Board C-Bet',
    communityCards: [
      { rank: 'A', suit: 's' },
      { rank: '5', suit: 'c' },
      { rank: '2', suit: 'd' },
    ],
    holeCards: [
      { rank: 'J', suit: 'h' },
      { rank: 'J', suit: 'd' },
    ],
    pot: 16,
    callAmount: 8,
    evTable: { raise: 2.90, call: 1.50, fold: -0.70 },
  },
  {
    id: 'turn-overcard',
    label: 'Turn · Scary Overcard',
    communityCards: [
      { rank: '9', suit: 'h' },
      { rank: '6', suit: 's' },
      { rank: '3', suit: 'c' },
      { rank: 'A', suit: 'd' },
    ],
    holeCards: [
      { rank: '9', suit: 'd' },
      { rank: '9', suit: 'c' },
    ],
    pot: 32,
    callAmount: 16,
    evTable: { raise: 0.80, call: 1.60, fold: -0.40 },
  },
  {
    id: 'river-bluffcatch',
    label: 'River · Bluff Catch',
    communityCards: [
      { rank: 'K', suit: 'h' },
      { rank: '10', suit: 's' },
      { rank: '4', suit: 'd' },
      { rank: '7', suit: 'c' },
      { rank: 'J', suit: 'h' },
    ],
    holeCards: [
      { rank: 'K', suit: 'd' },
      { rank: 'Q', suit: 's' },
    ],
    pot: 70,
    callAmount: 45,
    evTable: { call: 2.40, fold: -1.80, raise: -0.50 },
  },
  {
    id: 'flop-3way',
    label: 'Flop · 3-Way Pot',
    communityCards: [
      { rank: 'J', suit: 'c' },
      { rank: '8', suit: 'h' },
      { rank: '5', suit: 's' },
    ],
    holeCards: [
      { rank: 'J', suit: 's' },
      { rank: '10', suit: 'h' },
    ],
    pot: 42,
    callAmount: 18,
    evTable: { raise: 3.70, call: 2.20, fold: -0.90 },
  },
];

export function pickScenarios(count: number, exclude: string[] = []): ArenaScenario[] {
  const pool = ARENA_SCENARIOS.filter((s) => !exclude.includes(s.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
