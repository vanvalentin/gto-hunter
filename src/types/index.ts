export type Suit = 's' | 'h' | 'c' | 'd';
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2' | '10';
export type Decision = 'fold' | 'call' | 'raise';
export type Screen = 'hub' | 'learn' | 'adventure' | 'arena' | 'shop' | 'profile';

export interface OwnedCardSkin {
  cardKey: string; // "A-s", "K-h", etc.
  rank: string;
  suit: Suit;
  skinId: string;
}

export interface CardPackDefinition {
  id: string;
  name: string;
  description: string;
  priceGold: number;
  cardsPerPack: number;
  skinPool: string[];
  guaranteedRarity?: SkinRarity;
}

export interface Card {
  rank: Rank | string;
  suit: Suit;
}

export type SkinRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ChipSkin {
  id: string;
  name: string;
  rarity: SkinRarity;
  priceGold: number;
  priceGems: number;
  chipBg: string;
  chipBorder: string;
  chipShadow: string;
  multBg: string;
  multBorder: string;
  multShadow: string;
  icon: string;
  owned?: boolean;
  equipped?: boolean;
}

export interface CardSkin {
  id: string;
  name: string;
  rarity: SkinRarity;
  priceGold: number;
  priceGems: number;
  backColor: string;
  borderColor: string;
  glowColor: string;
  pattern: 'classic' | 'flames' | 'galaxy' | 'neon' | 'royal' | 'shadow' | 'frost' | 'gold';
  owned?: boolean;
  equipped?: boolean;
}

export interface Player {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  gems: number;
  elo: number;
  eloDuel: number;
  eloPoker3: number;
  eloPoker5: number;
  wins: number;
  losses: number;
  streak: number;
  equippedSkinId: string;
  inventory: string[];
}

export interface GameState {
  street: number;
  pot: number;
  oppBet: number;
  communityCards: Card[];
  betSize: number;
  showInsight: boolean;
  decision: Decision | null;
}

export type NodeStatus = 'mastered' | 'active' | 'locked';

export interface SkillNode {
  id: number;
  status: NodeStatus;
  x: string;
  y: number;
  delay: number;
  label?: string;
  topic?: string;
}

export type TierID = 'novice' | 'beginner' | 'intermediate' | 'expert' | 'legend';

export interface TierProgress {
  stars: number;
  bestScore: number;
  timesPlayed: number;
}

export interface HandStrategy {
  raise: number;
  call: number;
  fold: number;
}

export interface HandData {
  strategy: HandStrategy;
  ev: number;
}

export type AdventureRegionStatus = 'locked' | 'available' | 'completed';

export interface AdventureStage {
  id: number;
  name: string;
  stars: number;
  completed: boolean;
  isBoss?: boolean;
}

export interface AdventureRegion {
  id: string;
  name: string;
  flavor: string;
  status: AdventureRegionStatus;
  stages: AdventureStage[];
  rewardSkinId?: string;
}

export interface PvPMatch {
  roomId: string;
  opponentName: string;
  opponentSkinId: string;
  opponentElo: number;
}

export interface RoundResult {
  playerDecision: Decision;
  opponentDecision: Decision;
  playerEV: number;
  opponentEV: number;
  playerWon: boolean;
}

export interface AdventureProgress {
  [stageKey: string]: { completed: boolean; stars: number };
}

// ── Arena PVP ────────────────────────────────────────────────────────────────

export type ArenaMode = 'duel' | 'poker3' | 'poker5';

export interface ArenaMember {
  name: string;
  avatar: string;
  elo: number;
  skinId: string;
}

export interface ArenaScenario {
  id: string;
  label: string;
  communityCards: Card[];
  holeCards: Card[];
  pot: number;
  callAmount: number;
  evTable: Record<Decision, number>;
}

export interface MultiRoundResult {
  round: number;
  scenario: ArenaScenario;
  playerDecision: Decision;
  opponentDecision: Decision;
  playerEV: number;
  opponentEV: number;
  playerWon: boolean;
}

// ── Texas Hold'em Poker ──────────────────────────────────────────────────────

export type PokerStreet = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
export type PokerAction = 'fold' | 'check' | 'call' | 'raise' | 'all-in';

export interface PokerSeat {
  id: number;
  name: string;
  avatar: string;
  stack: number;
  holeCards: Card[];
  bet: number;
  folded: boolean;
  isAllIn: boolean;
  isPlayer: boolean;
  position: 'dealer' | 'sb' | 'bb' | 'utg' | 'mp' | 'co';
  chipSkinId?: string;
  cardSkinId?: string;
}

export interface PokerPot {
  amount: number;
  eligibleSeats: number[];
}

export interface PokerGameState {
  street: PokerStreet;
  communityCards: Card[];
  seats: PokerSeat[];
  pots: PokerPot[];
  currentSeat: number;
  dealerSeat: number;
  handNumber: number;
  maxHands: number;
  phase: 'betting' | 'dealing' | 'showdown' | 'hand_over' | 'game_over';
  lastAction?: { seatId: number; action: PokerAction; amount?: number };
  winners?: Array<{ seatId: number; amount: number; handName: string }>;
  minRaise: number;
  lastRaise: number;
}
