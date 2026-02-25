import type { Card, Decision, TierID } from '../../types';

export interface TierScenario {
  id: string;
  /** 'example' = tutorial hand with overlaid explanations; 'practice' (default) = normal exercise */
  type?: 'practice' | 'example';
  handLabel: string;
  conceptNote: string;
  holeCards: [Card, Card];
  streets: string[];
  potByStreet: number[];
  oppBetByStreet: number[];
  betSizeByStreet: number[];
  boardByStreet: Card[][];
  evTable: Record<number, Record<Decision, number>>;
  optimal: Record<number, Decision>;
  gtoFreqByStreet: Record<number, { fold: number; call: number; raise: number }>;
  insightByStreet: Record<number, string>;
}

export type AnyExercise = TierScenario;

export function isExample(ex: AnyExercise): boolean {
  return ex.type === 'example';
}

// ── Novice example hand ───────────────────────────────────────
const NOVICE_EXAMPLE: TierScenario = {
  id: 'nov-example',
  type: 'example',
  handLabel: 'Your First Hand',
  conceptNote: 'Follow the guided tips, then make your decision',
  holeCards: [{ rank: 'A', suit: 'h' }, { rank: 'K', suit: 'c' }],
  streets: ['Flop'],
  potByStreet: [16],
  oppBetByStreet: [8],
  betSizeByStreet: [24],
  boardByStreet: [
    [{ rank: 'A', suit: 's' }, { rank: '7', suit: 'd' }, { rank: '2', suit: 'c' }],
  ],
  evTable: {
    0: { call: 1.4, raise: 2.4, fold: -0.8 },
  },
  optimal: { 0: 'raise' },
  gtoFreqByStreet: {
    0: { fold: 0, call: 25, raise: 75 },
  },
  insightByStreet: {
    0: 'TPTK on a dry rainbow board. Raise to build the pot — your opponent can\'t have many strong hands here.',
  },
};

export const TIER_SCENARIOS: Record<TierID, AnyExercise[]> = {
  // ────────────────────────────────────────────────────────────
  // NOVICE — 1 example hand + 3 practice exercises
  // ────────────────────────────────────────────────────────────
  novice: [
    NOVICE_EXAMPLE,
    {
      id: 'nov-1',
      type: 'practice' as const,
      handLabel: 'Raise Your Monsters',
      conceptNote: 'Top pair top kicker — always build the pot for value',
      holeCards: [{ rank: 'A', suit: 'h' }, { rank: 'K', suit: 'c' }],
      streets: ['Flop'],
      potByStreet: [16],
      oppBetByStreet: [8],
      betSizeByStreet: [24],
      boardByStreet: [
        [{ rank: 'A', suit: 's' }, { rank: '7', suit: 'd' }, { rank: '2', suit: 'c' }],
      ],
      evTable: {
        0: { call: 1.4, raise: 2.4, fold: -0.8 },
      },
      optimal: { 0: 'raise' },
      gtoFreqByStreet: {
        0: { fold: 0, call: 25, raise: 75 },
      },
      insightByStreet: {
        0: 'TPTK on a dry rainbow board. Raise to build value — opponent can\'t have many strong hands here.',
      },
    },
    {
      id: 'nov-2',
      type: 'practice' as const,
      handLabel: 'Pot Control with an Overpair',
      conceptNote: 'Overpairs lose value against aggression — learn when to pump the brakes',
      holeCards: [{ rank: 'Q', suit: 'h' }, { rank: 'Q', suit: 'd' }],
      streets: ['Flop'],
      potByStreet: [21],
      oppBetByStreet: [14],
      betSizeByStreet: [35],
      boardByStreet: [
        [{ rank: 'K', suit: 's' }, { rank: '8', suit: 'd' }, { rank: '3', suit: 'c' }],
      ],
      evTable: {
        0: { call: 1.8, raise: -0.6, fold: -1.0 },
      },
      optimal: { 0: 'call' },
      gtoFreqByStreet: {
        0: { fold: 5, call: 75, raise: 20 },
      },
      insightByStreet: {
        0: 'The K is an overcard to your QQ. Call to keep the pot small — raising stacks you against KK, KQ, K8. Pot control is key with a vulnerable overpair.',
      },
    },
    {
      id: 'nov-3',
      type: 'practice' as const,
      handLabel: 'Nothing but Air — Just Fold',
      conceptNote: 'Recognise when you have zero equity and no fold equity',
      holeCards: [{ rank: '7', suit: 'd' }, { rank: '6', suit: 'd' }],
      streets: ['Flop'],
      potByStreet: [20],
      oppBetByStreet: [20],
      betSizeByStreet: [40],
      boardByStreet: [
        [{ rank: 'A', suit: 'c' }, { rank: 'K', suit: 'h' }, { rank: 'T', suit: 's' }],
      ],
      evTable: {
        0: { call: -1.2, raise: -2.8, fold: -0.5 },
      },
      optimal: { 0: 'fold' },
      gtoFreqByStreet: {
        0: { fold: 85, call: 15, raise: 0 },
      },
      insightByStreet: {
        0: 'No pair, no draw on a high, connected board. A pot-sized bet from opponent means they have a strong range. Fold and protect your stack.',
      },
    },
  ],

  // ────────────────────────────────────────────────────────────
  // BEGINNER — 3 exercises, 2 decisions each
  // ────────────────────────────────────────────────────────────
  beginner: [
    {
      id: 'beg-1',
      handLabel: 'Open-Ended Straight Draw',
      conceptNote: 'Semi-bluff raises with draws — earn fold equity on top of your outs',
      holeCards: [{ rank: '7', suit: 'h' }, { rank: '6', suit: 'h' }],
      streets: ['Flop', 'Turn'],
      potByStreet: [20, 52],
      oppBetByStreet: [10, 26],
      betSizeByStreet: [30, 52],
      boardByStreet: [
        [{ rank: '8', suit: 'd' }, { rank: '5', suit: 'c' }, { rank: 'K', suit: 'h' }],
        [{ rank: '8', suit: 'd' }, { rank: '5', suit: 'c' }, { rank: 'K', suit: 'h' }, { rank: '4', suit: 's' }],
      ],
      evTable: {
        0: { call: 1.2, raise: 2.1, fold: -1.0 },
        1: { call: 4.8, raise: 3.2, fold: -2.6 },
      },
      optimal: { 0: 'raise', 1: 'call' },
      gtoFreqByStreet: {
        0: { fold: 5, call: 35, raise: 60 },
        1: { fold: 10, call: 65, raise: 25 },
      },
      insightByStreet: {
        0: 'OESD with 8 outs (32% equity). Semi-bluff raise: if they fold you win now, if they call you have equity.',
        1: 'Straight hit on the turn! Call to keep opponent in — raising risks blowing them off weaker hands.',
      },
    },
    {
      id: 'beg-2',
      handLabel: 'Flush Draw with Overcards',
      conceptNote: 'Nut flush draws + backdoor equity give you immense power on the flop',
      holeCards: [{ rank: 'A', suit: 'h' }, { rank: 'T', suit: 'h' }],
      streets: ['Flop', 'Turn'],
      potByStreet: [24, 60],
      oppBetByStreet: [12, 0],
      betSizeByStreet: [24, 40],
      boardByStreet: [
        [{ rank: 'K', suit: 'h' }, { rank: '8', suit: 'h' }, { rank: '3', suit: 'c' }],
        [{ rank: 'K', suit: 'h' }, { rank: '8', suit: 'h' }, { rank: '3', suit: 'c' }, { rank: '2', suit: 'd' }],
      ],
      evTable: {
        0: { call: 1.6, raise: 0.9, fold: -1.2 },
        1: { call: 0.8, raise: 3.4, fold: -2.4 },
      },
      optimal: { 0: 'call', 1: 'raise' },
      gtoFreqByStreet: {
        0: { fold: 0, call: 70, raise: 30 },
        1: { fold: 15, call: 40, raise: 45 },
      },
      insightByStreet: {
        0: 'Nut flush draw + A overcard. Call the flop — you have 9 outs to the nuts and aren\'t crushed by their range.',
        1: 'Blank turn and opponent checks. Lead out as a semi-bluff: you have 9 flush outs and 3 ace outs. Huge equity + fold equity.',
      },
    },
    {
      id: 'beg-3',
      handLabel: 'Top Pair, Turn Check-Raise',
      conceptNote: 'Use check-raises on the turn to balance your OOP range with strong hands',
      holeCards: [{ rank: 'A', suit: 'd' }, { rank: 'Q', suit: 'd' }],
      streets: ['Flop', 'Turn'],
      potByStreet: [22, 54],
      oppBetByStreet: [11, 27],
      betSizeByStreet: [33, 54],
      boardByStreet: [
        [{ rank: 'Q', suit: 'h' }, { rank: '7', suit: 'c' }, { rank: '2', suit: 's' }],
        [{ rank: 'Q', suit: 'h' }, { rank: '7', suit: 'c' }, { rank: '2', suit: 's' }, { rank: '9', suit: 'd' }],
      ],
      evTable: {
        0: { call: 2.0, raise: 1.3, fold: -1.1 },
        1: { call: 1.6, raise: 4.2, fold: -2.7 },
      },
      optimal: { 0: 'call', 1: 'raise' },
      gtoFreqByStreet: {
        0: { fold: 0, call: 60, raise: 40 },
        1: { fold: 5, call: 35, raise: 60 },
      },
      insightByStreet: {
        0: 'TPTK OOP (out of position). Call the flop to control pot size and disguise your hand strength.',
        1: 'Turn is a blank. Check-raise for value — opponent bets into your strong range so punish them with a raise.',
      },
    },
  ],

  // ────────────────────────────────────────────────────────────
  // INTERMEDIATE — 4 exercises, 3 decisions each
  // ────────────────────────────────────────────────────────────
  intermediate: [
    {
      id: 'int-1',
      handLabel: 'Nut Flush Draw in 3-Bet Pot',
      conceptNote: 'Three-street planning — big draws play best as semi-bluff raises',
      holeCards: [{ rank: 'Q', suit: 's' }, { rank: 'J', suit: 's' }],
      streets: ['Flop', 'Turn', 'River'],
      potByStreet: [28, 68, 148],
      oppBetByStreet: [14, 34, 74],
      betSizeByStreet: [42, 68, 148],
      boardByStreet: [
        [{ rank: 'K', suit: 's' }, { rank: '9', suit: 's' }, { rank: '3', suit: 'h' }],
        [{ rank: 'K', suit: 's' }, { rank: '9', suit: 's' }, { rank: '3', suit: 'h' }, { rank: '2', suit: 'd' }],
        [{ rank: 'K', suit: 's' }, { rank: '9', suit: 's' }, { rank: '3', suit: 'h' }, { rank: '2', suit: 'd' }, { rank: 'A', suit: 's' }],
      ],
      evTable: {
        0: { call: 1.8, raise: 3.2, fold: -1.4 },
        1: { call: 0.6, raise: -0.9, fold: -2.8 },
        2: { call: 1.2, raise: 8.4, fold: -3.7 },
      },
      optimal: { 0: 'raise', 1: 'call', 2: 'raise' },
      gtoFreqByStreet: {
        0: { fold: 0, call: 30, raise: 70 },
        1: { fold: 15, call: 70, raise: 15 },
        2: { fold: 0, call: 25, raise: 75 },
      },
      insightByStreet: {
        0: 'Nut flush draw + gutshot. Raise as a semi-bluff with 12 outs (48% equity) plus massive fold equity in 3-bet pots.',
        1: 'Blank turn — call to keep pot size manageable while drawing. Raising is too thin.',
        2: 'Nut flush completes on the river — raise for maximum value against a range that called twice.',
      },
    },
    {
      id: 'int-2',
      handLabel: 'Slowplay a Set',
      conceptNote: 'Monster hands can trap opponents — disguise strength, extract maximum value',
      holeCards: [{ rank: '7', suit: 'c' }, { rank: '7', suit: 'h' }],
      streets: ['Flop', 'Turn', 'River'],
      potByStreet: [18, 40, 90],
      oppBetByStreet: [9, 20, 45],
      betSizeByStreet: [27, 40, 90],
      boardByStreet: [
        [{ rank: '7', suit: 's' }, { rank: 'K', suit: 'd' }, { rank: '3', suit: 'c' }],
        [{ rank: '7', suit: 's' }, { rank: 'K', suit: 'd' }, { rank: '3', suit: 'c' }, { rank: 'Q', suit: 's' }],
        [{ rank: '7', suit: 's' }, { rank: 'K', suit: 'd' }, { rank: '3', suit: 'c' }, { rank: 'Q', suit: 's' }, { rank: '5', suit: 'd' }],
      ],
      evTable: {
        0: { call: 3.8, raise: 2.1, fold: -0.9 },
        1: { call: 4.2, raise: 2.6, fold: -2.0 },
        2: { call: 2.8, raise: 6.5, fold: -4.5 },
      },
      optimal: { 0: 'call', 1: 'call', 2: 'raise' },
      gtoFreqByStreet: {
        0: { fold: 0, call: 65, raise: 35 },
        1: { fold: 0, call: 70, raise: 30 },
        2: { fold: 0, call: 30, raise: 70 },
      },
      insightByStreet: {
        0: 'Bottom set on K73. Slowplay — call to keep opponent\'s range wide and let them barrel with worse hands.',
        1: 'Q gives opponent more equity. Keep slowplaying — the pot is growing and you have the nuts.',
        2: 'Blank river. Now raise for full value! Opponent has barreled three times; make them pay with KQ, KJ, QQ.',
      },
    },
    {
      id: 'int-3',
      handLabel: 'The Double-Barrel Bluff',
      conceptNote: 'Continuation betting across multiple streets applies maximum pressure',
      holeCards: [{ rank: '6', suit: 'd' }, { rank: '5', suit: 'd' }],
      streets: ['Flop', 'Turn', 'River'],
      potByStreet: [20, 52, 120],
      oppBetByStreet: [10, 0, 0],
      betSizeByStreet: [30, 52, 120],
      boardByStreet: [
        [{ rank: 'A', suit: 's' }, { rank: '8', suit: 'd' }, { rank: '3', suit: 'c' }],
        [{ rank: 'A', suit: 's' }, { rank: '8', suit: 'd' }, { rank: '3', suit: 'c' }, { rank: '2', suit: 's' }],
        [{ rank: 'A', suit: 's' }, { rank: '8', suit: 'd' }, { rank: '3', suit: 'c' }, { rank: '2', suit: 's' }, { rank: '9', suit: 'h' }],
      ],
      evTable: {
        0: { call: -0.8, raise: 1.6, fold: -0.5 },
        1: { call: -1.2, raise: 2.4, fold: -0.6 },
        2: { call: -2.0, raise: -0.4, fold: -0.8 },
      },
      optimal: { 0: 'raise', 1: 'raise', 2: 'fold' },
      gtoFreqByStreet: {
        0: { fold: 35, call: 20, raise: 45 },
        1: { fold: 30, call: 20, raise: 50 },
        2: { fold: 55, call: 10, raise: 35 },
      },
      insightByStreet: {
        0: 'Pure air but dry A-high board. Bluff — your range is uncapped and opponent will check-fold marginal hands.',
        1: 'Got a gutshot (2♠). Keep the pressure on with a second barrel — now you have 4 outs plus bluff equity.',
        2: 'Missed everything. Fold — you have shown aggression on two streets, river bluffing is too costly with no fold equity left.',
      },
    },
    {
      id: 'int-4',
      handLabel: 'OOP Street-by-Street with TPTK',
      conceptNote: 'Playing strong hands out of position requires discipline and timing',
      holeCards: [{ rank: 'A', suit: 'c' }, { rank: 'Q', suit: 'c' }],
      streets: ['Flop', 'Turn', 'River'],
      potByStreet: [24, 58, 136],
      oppBetByStreet: [12, 29, 68],
      betSizeByStreet: [36, 58, 136],
      boardByStreet: [
        [{ rank: 'A', suit: 'h' }, { rank: '7', suit: 'd' }, { rank: '2', suit: 'c' }],
        [{ rank: 'A', suit: 'h' }, { rank: '7', suit: 'd' }, { rank: '2', suit: 'c' }, { rank: 'J', suit: 's' }],
        [{ rank: 'A', suit: 'h' }, { rank: '7', suit: 'd' }, { rank: '2', suit: 'c' }, { rank: 'J', suit: 's' }, { rank: '4', suit: 'd' }],
      ],
      evTable: {
        0: { call: 2.4, raise: 3.6, fold: -1.2 },
        1: { call: 2.8, raise: 1.4, fold: -2.9 },
        2: { call: 3.2, raise: 1.8, fold: -3.4 },
      },
      optimal: { 0: 'raise', 1: 'call', 2: 'call' },
      gtoFreqByStreet: {
        0: { fold: 0, call: 20, raise: 80 },
        1: { fold: 10, call: 65, raise: 25 },
        2: { fold: 15, call: 70, raise: 15 },
      },
      insightByStreet: {
        0: 'TPTK out of position. Raise now to build the pot and deny equity from straight and flush draws.',
        1: 'J is a semi-dangerous card — connects with JT. Call to pot control and avoid ballooning against two-pair hands.',
        2: 'Blank river. Call the bet — your TPTK is still good against their value range. Raising is too thin.',
      },
    },
  ],

  // ────────────────────────────────────────────────────────────
  // EXPERT — 4 exercises, 3 decisions each
  // ────────────────────────────────────────────────────────────
  expert: [
    {
      id: 'exp-1',
      handLabel: 'Hero Call in a 3-Bet Pot',
      conceptNote: 'Bluff-catching — GTO frequencies dictate when to hero-call on the river',
      holeCards: [{ rank: 'A', suit: 'd' }, { rank: 'Q', suit: 'd' }],
      streets: ['Flop', 'Turn', 'River'],
      potByStreet: [42, 96, 192],
      oppBetByStreet: [21, 48, 96],
      betSizeByStreet: [63, 96, 192],
      boardByStreet: [
        [{ rank: 'Q', suit: 'c' }, { rank: '8', suit: 'h' }, { rank: '5', suit: 'd' }],
        [{ rank: 'Q', suit: 'c' }, { rank: '8', suit: 'h' }, { rank: '5', suit: 'd' }, { rank: '2', suit: 's' }],
        [{ rank: 'Q', suit: 'c' }, { rank: '8', suit: 'h' }, { rank: '5', suit: 'd' }, { rank: '2', suit: 's' }, { rank: 'J', suit: 'd' }],
      ],
      evTable: {
        0: { call: 3.5, raise: 4.8, fold: -2.1 },
        1: { call: 2.2, raise: 5.1, fold: -4.8 },
        2: { call: 1.4, raise: -2.3, fold: -4.8 },
      },
      optimal: { 0: 'raise', 1: 'raise', 2: 'call' },
      gtoFreqByStreet: {
        0: { fold: 0, call: 20, raise: 80 },
        1: { fold: 10, call: 25, raise: 65 },
        2: { fold: 20, call: 55, raise: 25 },
      },
      insightByStreet: {
        0: 'TPTK in a 3-bet pot on a dry flop. Raise — you have the best hand most of the time, build the pot.',
        1: 'Brick turn — raise again. You have range advantage, apply maximum pressure on Qx and draws.',
        2: 'Diamond flush completes. They pot-size bet — GTO calls. Your QQ blocks some of their value (QJ). Raising is a mistake here.',
      },
    },
    {
      id: 'exp-2',
      handLabel: 'Triple Barrel Value on a Dry Runout',
      conceptNote: 'Thin value over three streets extracts maximum EV against wide calling ranges',
      holeCards: [{ rank: 'A', suit: 'c' }, { rank: 'K', suit: 'c' }],
      streets: ['Flop', 'Turn', 'River'],
      potByStreet: [36, 84, 192],
      oppBetByStreet: [18, 42, 0],
      betSizeByStreet: [54, 84, 128],
      boardByStreet: [
        [{ rank: 'K', suit: 'd' }, { rank: '8', suit: 's' }, { rank: '3', suit: 'h' }],
        [{ rank: 'K', suit: 'd' }, { rank: '8', suit: 's' }, { rank: '3', suit: 'h' }, { rank: '7', suit: 'c' }],
        [{ rank: 'K', suit: 'd' }, { rank: '8', suit: 's' }, { rank: '3', suit: 'h' }, { rank: '7', suit: 'c' }, { rank: '2', suit: 'd' }],
      ],
      evTable: {
        0: { call: 2.8, raise: 5.4, fold: -1.8 },
        1: { call: 3.2, raise: 6.1, fold: -4.2 },
        2: { call: 1.0, raise: 4.6, fold: -4.8 },
      },
      optimal: { 0: 'raise', 1: 'raise', 2: 'raise' },
      gtoFreqByStreet: {
        0: { fold: 0, call: 15, raise: 85 },
        1: { fold: 5, call: 20, raise: 75 },
        2: { fold: 0, call: 20, raise: 80 },
      },
      insightByStreet: {
        0: 'Top two pair on a dry board. Raise — you are heavily ahead, start building a big pot immediately.',
        1: 'Blank turn. Raise again — opponent is still calling with Kx, sets, and draws. Three barrels expected.',
        2: 'Rainbow brick river — opponent checks. Bet for value. Runout is perfect for you; opponent has no reason to bluff catch worse.',
      },
    },
    {
      id: 'exp-3',
      handLabel: 'Straight Completes — River Shove',
      conceptNote: 'Recognise when your hand is the nuts and size up to max value',
      holeCards: [{ rank: 'K', suit: 'd' }, { rank: 'Q', suit: 's' }],
      streets: ['Flop', 'Turn', 'River'],
      potByStreet: [30, 72, 168],
      oppBetByStreet: [15, 36, 0],
      betSizeByStreet: [45, 72, 168],
      boardByStreet: [
        [{ rank: 'J', suit: 's' }, { rank: 'T', suit: 'd' }, { rank: '4', suit: 'c' }],
        [{ rank: 'J', suit: 's' }, { rank: 'T', suit: 'd' }, { rank: '4', suit: 'c' }, { rank: '9', suit: 'd' }],
        [{ rank: 'J', suit: 's' }, { rank: 'T', suit: 'd' }, { rank: '4', suit: 'c' }, { rank: '9', suit: 'd' }, { rank: '8', suit: 'c' }],
      ],
      evTable: {
        0: { call: 1.4, raise: 2.6, fold: -1.5 },
        1: { call: 5.8, raise: 4.2, fold: -3.6 },
        2: { call: 2.2, raise: 9.4, fold: -8.4 },
      },
      optimal: { 0: 'raise', 1: 'call', 2: 'raise' },
      gtoFreqByStreet: {
        0: { fold: 10, call: 30, raise: 60 },
        1: { fold: 0, call: 75, raise: 25 },
        2: { fold: 0, call: 15, raise: 85 },
      },
      insightByStreet: {
        0: 'OESD — raise as a semi-bluff. You have 8 outs plus massive fold equity in position.',
        1: 'OESD gets there (open-straight board). Call and keep them in — don\'t blow them off second-best hands yet.',
        2: 'You rivered the nut straight. Opponent checks. Shove! They have flushes, sets, straights to pay off.',
      },
    },
    {
      id: 'exp-4',
      handLabel: 'Thin Value — River Block Bet',
      conceptNote: 'Block betting controls pot size and extracts thin value from bluff-catchers',
      holeCards: [{ rank: 'A', suit: 's' }, { rank: '9', suit: 's' }],
      streets: ['Flop', 'Turn', 'River'],
      potByStreet: [26, 60, 132],
      oppBetByStreet: [13, 30, 0],
      betSizeByStreet: [39, 60, 44],
      boardByStreet: [
        [{ rank: '9', suit: 'd' }, { rank: '8', suit: 'c' }, { rank: '2', suit: 'h' }],
        [{ rank: '9', suit: 'd' }, { rank: '8', suit: 'c' }, { rank: '2', suit: 'h' }, { rank: '5', suit: 'c' }],
        [{ rank: '9', suit: 'd' }, { rank: '8', suit: 'c' }, { rank: '2', suit: 'h' }, { rank: '5', suit: 'c' }, { rank: 'K', suit: 'c' }],
      ],
      evTable: {
        0: { call: 2.6, raise: 3.8, fold: -1.3 },
        1: { call: 2.0, raise: 0.8, fold: -3.0 },
        2: { call: 1.2, raise: 3.6, fold: -3.3 },
      },
      optimal: { 0: 'raise', 1: 'call', 2: 'raise' },
      gtoFreqByStreet: {
        0: { fold: 0, call: 25, raise: 75 },
        1: { fold: 10, call: 70, raise: 20 },
        2: { fold: 0, call: 35, raise: 65 },
      },
      insightByStreet: {
        0: 'Middle pair top kicker — raise for value. You beat most of their one-pair bluffing range.',
        1: 'Blank turn — call to pot control. You\'re ahead but vulnerable; raising inflates the pot unnecessarily.',
        2: 'Opponent checks the river. Block bet small (33%). You extract value from bluff catchers while limiting risk if they hold a K.',
      },
    },
  ],

  // ────────────────────────────────────────────────────────────
  // LEGEND — 4 exercises, 3 decisions each
  // ────────────────────────────────────────────────────────────
  legend: [
    {
      id: 'leg-1',
      handLabel: 'Polarised River Bluff',
      conceptNote: 'Solver-level balance — exploit thin river spots with mixed strategies',
      holeCards: [{ rank: 'K', suit: 'h' }, { rank: 'Q', suit: 'h' }],
      streets: ['Flop', 'Turn', 'River'],
      potByStreet: [60, 148, 356],
      oppBetByStreet: [30, 74, 178],
      betSizeByStreet: [90, 148, 356],
      boardByStreet: [
        [{ rank: 'J', suit: 'h' }, { rank: 'T', suit: 'h' }, { rank: '3', suit: 'c' }],
        [{ rank: 'J', suit: 'h' }, { rank: 'T', suit: 'h' }, { rank: '3', suit: 'c' }, { rank: '9', suit: 'd' }],
        [{ rank: 'J', suit: 'h' }, { rank: 'T', suit: 'h' }, { rank: '3', suit: 'c' }, { rank: '9', suit: 'd' }, { rank: '2', suit: 'h' }],
      ],
      evTable: {
        0: { call: 2.1, raise: 6.8, fold: -3.0 },
        1: { call: 5.4, raise: 9.2, fold: -7.4 },
        2: { call: -0.8, raise: 4.1, fold: -8.9 },
      },
      optimal: { 0: 'raise', 1: 'raise', 2: 'raise' },
      gtoFreqByStreet: {
        0: { fold: 0, call: 15, raise: 85 },
        1: { fold: 0, call: 30, raise: 70 },
        2: { fold: 0, call: 35, raise: 65 },
      },
      insightByStreet: {
        0: 'Mega-draw: nut flush draw + OESD = 15 outs. Semi-bluff raise at near-maximum frequency.',
        1: 'Straight completes. Raise again — opponent cannot profitably call at this frequency density.',
        2: 'Flush completes. Opponent checks. Raise for max value — your range is heavily weighted to flushes here.',
      },
    },
    {
      id: 'leg-2',
      handLabel: 'Nut-Nut Combo Draw',
      conceptNote: 'Premium draw combinations have near-equity with made hands — play them aggressively',
      holeCards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 's' }],
      streets: ['Flop', 'Turn', 'River'],
      potByStreet: [50, 128, 304],
      oppBetByStreet: [25, 64, 152],
      betSizeByStreet: [75, 128, 304],
      boardByStreet: [
        [{ rank: 'Q', suit: 's' }, { rank: 'J', suit: 's' }, { rank: '2', suit: 'c' }],
        [{ rank: 'Q', suit: 's' }, { rank: 'J', suit: 's' }, { rank: '2', suit: 'c' }, { rank: 'T', suit: 'd' }],
        [{ rank: 'Q', suit: 's' }, { rank: 'J', suit: 's' }, { rank: '2', suit: 'c' }, { rank: 'T', suit: 'd' }, { rank: '8', suit: 's' }],
      ],
      evTable: {
        0: { call: 3.2, raise: 7.4, fold: -2.5 },
        1: { call: 4.6, raise: 8.8, fold: -6.4 },
        2: { call: 2.4, raise: 10.2, fold: -7.6 },
      },
      optimal: { 0: 'raise', 1: 'raise', 2: 'raise' },
      gtoFreqByStreet: {
        0: { fold: 0, call: 10, raise: 90 },
        1: { fold: 0, call: 20, raise: 80 },
        2: { fold: 0, call: 10, raise: 90 },
      },
      insightByStreet: {
        0: 'Nut flush draw + royal straight draw. Raise — 15 outs to the nuts, maximum semi-bluff power.',
        1: 'Straight draw still live; flush draw live. Raise — you are favourite against their made hands. Never fold.',
        2: 'Nut flush completes. Pure value — raise pot. You are unbeatable here and must extract maximum.',
      },
    },
    {
      id: 'leg-3',
      handLabel: 'Balanced Check-Raise River',
      conceptNote: 'Slowplayed monsters become devastating check-raises — essential for balanced strategy',
      holeCards: [{ rank: '8', suit: 'd' }, { rank: '8', suit: 'c' }],
      streets: ['Flop', 'Turn', 'River'],
      potByStreet: [32, 80, 180],
      oppBetByStreet: [16, 40, 0],
      betSizeByStreet: [48, 80, 120],
      boardByStreet: [
        [{ rank: '8', suit: 'h' }, { rank: '7', suit: 'd' }, { rank: '6', suit: 'c' }],
        [{ rank: '8', suit: 'h' }, { rank: '7', suit: 'd' }, { rank: '6', suit: 'c' }, { rank: 'A', suit: 's' }],
        [{ rank: '8', suit: 'h' }, { rank: '7', suit: 'd' }, { rank: '6', suit: 'c' }, { rank: 'A', suit: 's' }, { rank: '2', suit: 'd' }],
      ],
      evTable: {
        0: { call: 4.8, raise: 3.2, fold: -1.6 },
        1: { call: 5.0, raise: 3.6, fold: -4.0 },
        2: { call: 2.8, raise: 7.6, fold: -4.5 },
      },
      optimal: { 0: 'call', 1: 'call', 2: 'raise' },
      gtoFreqByStreet: {
        0: { fold: 0, call: 70, raise: 30 },
        1: { fold: 0, call: 72, raise: 28 },
        2: { fold: 0, call: 30, raise: 70 },
      },
      insightByStreet: {
        0: 'Top set on a wet coordinated board. Call to protect your hand range — raising gives away set strength on boards full of straights.',
        1: 'A is a scare card — slowplay continues. Let them double barrel with draws and bluffs.',
        2: 'Blank river and opponent checks. Check-raise! You\'ve trapped them. Extract maximum value from AK, A7, straights that missed value.',
      },
    },
    {
      id: 'leg-4',
      handLabel: 'River Probe Bet OOP',
      conceptNote: 'Leading the river out of position requires a polarised, solver-approved frequency',
      holeCards: [{ rank: 'J', suit: 's' }, { rank: 'T', suit: 'd' }],
      streets: ['Flop', 'Turn', 'River'],
      potByStreet: [28, 68, 152],
      oppBetByStreet: [14, 34, 0],
      betSizeByStreet: [42, 68, 100],
      boardByStreet: [
        [{ rank: 'Q', suit: 'c' }, { rank: 'J', suit: 'h' }, { rank: '4', suit: 's' }],
        [{ rank: 'Q', suit: 'c' }, { rank: 'J', suit: 'h' }, { rank: '4', suit: 's' }, { rank: '2', suit: 'd' }],
        [{ rank: 'Q', suit: 'c' }, { rank: 'J', suit: 'h' }, { rank: '4', suit: 's' }, { rank: '2', suit: 'd' }, { rank: '5', suit: 'c' }],
      ],
      evTable: {
        0: { call: 2.2, raise: 1.0, fold: -1.4 },
        1: { call: 1.8, raise: 0.4, fold: -3.4 },
        2: { call: 0.6, raise: 3.8, fold: -3.8 },
      },
      optimal: { 0: 'call', 1: 'call', 2: 'raise' },
      gtoFreqByStreet: {
        0: { fold: 0, call: 68, raise: 32 },
        1: { fold: 12, call: 65, raise: 23 },
        2: { fold: 0, call: 35, raise: 65 },
      },
      insightByStreet: {
        0: 'Middle pair + OESD to a straight. Call — you have too much equity to fold but not enough to raise OOP.',
        1: 'Blank turn. Call again — floating with pair and backdoor equity. Keep pot manageable.',
        2: 'Brick river and opponent checks. Donk lead! Probe bet to deny their free showdown and extract value from Jx.',
      },
    },
  ],
};
