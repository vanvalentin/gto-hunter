import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player, CardSkin, ChipSkin, AdventureProgress, ArenaMode, TierID, TierProgress, OwnedCardSkin, CardPackDefinition, Suit } from '../types';

const ALL_RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
const ALL_SUITS: Suit[] = ['s', 'h', 'c', 'd'];

export const AVAILABLE_CARD_PACKS: CardPackDefinition[] = [
  {
    id: 'pack-basic',
    name: 'Basic Pack',
    description: '4 random cards from common & rare skins.',
    priceGold: 250,
    cardsPerPack: 4,
    skinPool: ['shadow', 'frost'],
  },
  {
    id: 'pack-premium',
    name: 'Premium Pack',
    description: '4 cards with a chance of epic skins.',
    priceGold: 600,
    cardsPerPack: 4,
    skinPool: ['shadow', 'frost', 'flames', 'neon'],
    guaranteedRarity: 'rare',
  },
  {
    id: 'pack-elite',
    name: 'Elite Pack',
    description: 'Guaranteed epic or legendary skin cards.',
    priceGold: 1200,
    cardsPerPack: 4,
    skinPool: ['flames', 'neon', 'galaxy', 'royal', 'gold'],
    guaranteedRarity: 'epic',
  },
];

const DEFAULT_SKIN: CardSkin = {
  id: 'classic',
  name: 'Classic',
  rarity: 'common',
  priceGold: 0,
  priceGems: 0,
  backColor: '#1a1a2e',
  borderColor: '#C9A84C',
  glowColor: '#C9A84C',
  pattern: 'classic',
  owned: true,
  equipped: true,
};

export const AVAILABLE_SKINS: CardSkin[] = [
  DEFAULT_SKIN,
  {
    id: 'shadow',
    name: 'Shadow Veil',
    rarity: 'rare',
    priceGold: 500,
    priceGems: 0,
    backColor: '#0a0a0a',
    borderColor: '#6B21A8',
    glowColor: '#9333EA',
    pattern: 'shadow',
  },
  {
    id: 'frost',
    name: 'Arctic Frost',
    rarity: 'rare',
    priceGold: 500,
    priceGems: 0,
    backColor: '#0c1445',
    borderColor: '#22D3EE',
    glowColor: '#06B6D4',
    pattern: 'frost',
  },
  {
    id: 'flames',
    name: 'Inferno',
    rarity: 'epic',
    priceGold: 1200,
    priceGems: 0,
    backColor: '#1a0505',
    borderColor: '#F97316',
    glowColor: '#EF4444',
    pattern: 'flames',
  },
  {
    id: 'neon',
    name: 'Neon Pulse',
    rarity: 'epic',
    priceGold: 0,
    priceGems: 80,
    backColor: '#050520',
    borderColor: '#A855F7',
    glowColor: '#EC4899',
    pattern: 'neon',
  },
  {
    id: 'galaxy',
    name: 'Void Galaxy',
    rarity: 'legendary',
    priceGold: 0,
    priceGems: 200,
    backColor: '#02010a',
    borderColor: '#C9A84C',
    glowColor: '#8B5CF6',
    pattern: 'galaxy',
  },
  {
    id: 'royal',
    name: 'Royal Crest',
    rarity: 'legendary',
    priceGold: 3000,
    priceGems: 0,
    backColor: '#0d0a00',
    borderColor: '#FBBF24',
    glowColor: '#F59E0B',
    pattern: 'royal',
  },
  {
    id: 'gold',
    name: 'Pure Gold',
    rarity: 'legendary',
    priceGold: 0,
    priceGems: 350,
    backColor: '#1a1200',
    borderColor: '#FBBF24',
    glowColor: '#FBBF24',
    pattern: 'gold',
  },
];

export const AVAILABLE_CHIP_SKINS: ChipSkin[] = [
  {
    id: 'chip-classic',
    name: 'Classic Blue',
    rarity: 'common',
    priceGold: 0, priceGems: 0,
    chipBg: '#2563eb', chipBorder: '#1a4d8a', chipShadow: '#1a4d8a',
    multBg: '#e63946', multBorder: '#a01e28', multShadow: '#8a1920',
    icon: '🔵',
    owned: true, equipped: true,
  },
  {
    id: 'chip-gold',
    name: 'Gold Rush',
    rarity: 'rare',
    priceGold: 400, priceGems: 0,
    chipBg: '#d97706', chipBorder: '#92400e', chipShadow: '#78350f',
    multBg: '#b45309', multBorder: '#78350f', multShadow: '#5a2a0a',
    icon: '🟡',
  },
  {
    id: 'chip-casino',
    name: 'Casino White',
    rarity: 'rare',
    priceGold: 400, priceGems: 0,
    chipBg: '#e5e7eb', chipBorder: '#6b7280', chipShadow: '#4b5563',
    multBg: '#cc2936', multBorder: '#8a1920', multShadow: '#5a1015',
    icon: '⚪',
  },
  {
    id: 'chip-obsidian',
    name: 'Obsidian',
    rarity: 'epic',
    priceGold: 900, priceGems: 0,
    chipBg: '#1f2937', chipBorder: '#111827', chipShadow: '#030712',
    multBg: '#374151', multBorder: '#1f2937', multShadow: '#111827',
    icon: '⚫',
  },
  {
    id: 'chip-emerald',
    name: 'Emerald',
    rarity: 'epic',
    priceGold: 0, priceGems: 60,
    chipBg: '#059669', chipBorder: '#064e3b', chipShadow: '#022c22',
    multBg: '#10b981', multBorder: '#065f46', multShadow: '#022c22',
    icon: '🟢',
  },
  {
    id: 'chip-plasma',
    name: 'Plasma',
    rarity: 'legendary',
    priceGold: 0, priceGems: 180,
    chipBg: '#7c3aed', chipBorder: '#4c1d95', chipShadow: '#2e1065',
    multBg: '#a855f7', multBorder: '#6b21a8', multShadow: '#3b0764',
    icon: '🟣',
  },
  {
    id: 'chip-crimson',
    name: 'Crimson',
    rarity: 'legendary',
    priceGold: 2500, priceGems: 0,
    chipBg: '#991b1b', chipBorder: '#7f1d1d', chipShadow: '#450a0a',
    multBg: '#b91c1c', multBorder: '#7f1d1d', multShadow: '#450a0a',
    icon: '🔴',
  },
  {
    id: 'chip-crystal',
    name: 'Crystal Ice',
    rarity: 'legendary',
    priceGold: 0, priceGems: 250,
    chipBg: '#0891b2', chipBorder: '#164e63', chipShadow: '#082f49',
    multBg: '#06b6d4', multBorder: '#155e75', multShadow: '#082f49',
    icon: '🔷',
  },
];

const DEFAULT_CHIP_SKIN = AVAILABLE_CHIP_SKINS[0];

interface PlayerStore {
  player: Player;
  skins: CardSkin[];
  chipSkins: ChipSkin[];
  equippedSkin: CardSkin;
  equippedChipSkin: ChipSkin;
  adventureProgress: AdventureProgress;
  tierProgress: Record<TierID, TierProgress>;
  exerciseProgress: Record<string, TierProgress>;
  ownedCardItems: OwnedCardSkin[];
  deckCustomization: Record<string, string>;
  buySkin: (skinId: string) => { success: boolean; message: string };
  equipSkin: (skinId: string) => void;
  buyChipSkin: (skinId: string) => { success: boolean; message: string };
  equipChipSkin: (skinId: string) => void;
  buyCardPack: (packId: string) => { success: boolean; message: string; cards?: OwnedCardSkin[] };
  setCardSkin: (cardKey: string, skinId: string | null) => void;
  addGold: (amount: number) => void;
  addGems: (amount: number) => void;
  addXP: (amount: number) => void;
  recordWin: (mode?: ArenaMode) => void;
  recordLoss: (mode?: ArenaMode) => void;
  updateElo: (mode: ArenaMode, delta: number) => void;
  completeStage: (regionId: string, stageId: number, stars: number) => void;
  completeTier: (tierId: TierID, stars: number, score: number) => void;
  completeExercise: (exerciseId: string, stars: number, score: number) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      chipSkins: AVAILABLE_CHIP_SKINS.map((s) => ({
        ...s,
        owned: s.id === 'chip-classic',
        equipped: s.id === 'chip-classic',
      })),
      equippedChipSkin: DEFAULT_CHIP_SKIN,
      ownedCardItems: [
        // Spades: high cards with shadow/frost
        { cardKey: 'A-s',  rank: 'A',  suit: 's', skinId: 'galaxy' },
        { cardKey: 'K-s',  rank: 'K',  suit: 's', skinId: 'shadow' },
        { cardKey: 'Q-s',  rank: 'Q',  suit: 's', skinId: 'shadow' },
        { cardKey: 'J-s',  rank: 'J',  suit: 's', skinId: 'frost'  },
        { cardKey: 'T-s',  rank: 'T',  suit: 's', skinId: 'frost'  },
        { cardKey: '9-s',  rank: '9',  suit: 's', skinId: 'neon'   },
        { cardKey: '7-s',  rank: '7',  suit: 's', skinId: 'shadow' },
        // Hearts: fire/royal theme
        { cardKey: 'A-h',  rank: 'A',  suit: 'h', skinId: 'flames' },
        { cardKey: 'K-h',  rank: 'K',  suit: 'h', skinId: 'royal'  },
        { cardKey: 'Q-h',  rank: 'Q',  suit: 'h', skinId: 'flames' },
        { cardKey: 'J-h',  rank: 'J',  suit: 'h', skinId: 'neon'   },
        { cardKey: 'T-h',  rank: 'T',  suit: 'h', skinId: 'flames' },
        { cardKey: '5-h',  rank: '5',  suit: 'h', skinId: 'royal'  },
        { cardKey: '2-h',  rank: '2',  suit: 'h', skinId: 'shadow' },
        // Diamonds: frost/gold theme
        { cardKey: 'A-d',  rank: 'A',  suit: 'd', skinId: 'gold'   },
        { cardKey: 'K-d',  rank: 'K',  suit: 'd', skinId: 'gold'   },
        { cardKey: 'Q-d',  rank: 'Q',  suit: 'd', skinId: 'frost'  },
        { cardKey: 'J-d',  rank: 'J',  suit: 'd', skinId: 'frost'  },
        { cardKey: '8-d',  rank: '8',  suit: 'd', skinId: 'neon'   },
        { cardKey: '3-d',  rank: '3',  suit: 'd', skinId: 'gold'   },
        // Clubs: galaxy/neon
        { cardKey: 'A-c',  rank: 'A',  suit: 'c', skinId: 'galaxy' },
        { cardKey: 'K-c',  rank: 'K',  suit: 'c', skinId: 'neon'   },
        { cardKey: 'Q-c',  rank: 'Q',  suit: 'c', skinId: 'galaxy' },
        { cardKey: '6-c',  rank: '6',  suit: 'c', skinId: 'shadow' },
        { cardKey: '4-c',  rank: '4',  suit: 'c', skinId: 'frost'  },
      ],
      deckCustomization: {},
      adventureProgress: {},
      exerciseProgress: {},
      tierProgress: {
        novice:       { stars: 0, bestScore: 0, timesPlayed: 0 },
        beginner:     { stars: 0, bestScore: 0, timesPlayed: 0 },
        intermediate: { stars: 0, bestScore: 0, timesPlayed: 0 },
        expert:       { stars: 0, bestScore: 0, timesPlayed: 0 },
        legend:       { stars: 0, bestScore: 0, timesPlayed: 0 },
      },

      player: {
        id: 'local-player',
        username: 'Hunter',
        avatar: 'https://picsum.photos/seed/gtoplayer/100/100',
        level: 4,
        xp: 1450,
        xpToNext: 2000,
        gold: 850,
        gems: 25,
        elo: 1200,
        eloDuel: 1200,
        eloPoker3: 1200,
        eloPoker5: 1200,
        wins: 12,
        losses: 8,
        streak: 3,
        equippedSkinId: 'classic',
        inventory: ['classic'],
      },
      skins: AVAILABLE_SKINS.map((s) => ({
        ...s,
        owned: s.id === 'classic',
        equipped: s.id === 'classic',
      })),
      equippedSkin: DEFAULT_SKIN,

      buySkin: (skinId: string) => {
        const { player, skins } = get();
        const skin = skins.find((s) => s.id === skinId);
        if (!skin) return { success: false, message: 'Skin not found' };
        if (skin.owned) return { success: false, message: 'Already owned' };
        if (skin.priceGems > 0 && player.gems < skin.priceGems)
          return { success: false, message: 'Not enough Gems' };
        if (skin.priceGold > 0 && player.gold < skin.priceGold)
          return { success: false, message: 'Not enough Gold' };

        set((state) => ({
          player: {
            ...state.player,
            gold: skin.priceGold > 0 ? state.player.gold - skin.priceGold : state.player.gold,
            gems: skin.priceGems > 0 ? state.player.gems - skin.priceGems : state.player.gems,
            inventory: [...state.player.inventory, skinId],
          },
          skins: state.skins.map((s) => (s.id === skinId ? { ...s, owned: true } : s)),
        }));
        return { success: true, message: 'Purchased!' };
      },

      equipSkin: (skinId: string) => {
        const skin = get().skins.find((s) => s.id === skinId);
        if (!skin?.owned) return;
        set((state) => ({
          player: { ...state.player, equippedSkinId: skinId },
          equippedSkin: skin,
          skins: state.skins.map((s) => ({ ...s, equipped: s.id === skinId })),
        }));
      },

      buyChipSkin: (skinId: string) => {
        const { player, chipSkins } = get();
        const skin = chipSkins.find((s) => s.id === skinId);
        if (!skin) return { success: false, message: 'Skin not found' };
        if (skin.owned) return { success: false, message: 'Already owned' };
        if (skin.priceGems > 0 && player.gems < skin.priceGems)
          return { success: false, message: 'Not enough Gems' };
        if (skin.priceGold > 0 && player.gold < skin.priceGold)
          return { success: false, message: 'Not enough Gold' };

        set((state) => ({
          player: {
            ...state.player,
            gold: skin.priceGold > 0 ? state.player.gold - skin.priceGold : state.player.gold,
            gems: skin.priceGems > 0 ? state.player.gems - skin.priceGems : state.player.gems,
          },
          chipSkins: state.chipSkins.map((s) => (s.id === skinId ? { ...s, owned: true } : s)),
        }));
        return { success: true, message: 'Purchased!' };
      },

      equipChipSkin: (skinId: string) => {
        const skin = get().chipSkins.find((s) => s.id === skinId);
        if (!skin?.owned) return;
        set((state) => ({
          equippedChipSkin: skin,
          chipSkins: state.chipSkins.map((s) => ({ ...s, equipped: s.id === skinId })),
        }));
      },

      buyCardPack: (packId: string) => {
        const { player, ownedCardItems } = get();
        const pack = AVAILABLE_CARD_PACKS.find((p) => p.id === packId);
        if (!pack) return { success: false, message: 'Pack not found' };
        if (player.gold < pack.priceGold) return { success: false, message: 'Not enough Gold' };

        const allCards: { rank: string; suit: Suit }[] = [];
        for (const rank of ALL_RANKS) {
          for (const suit of ALL_SUITS) {
            allCards.push({ rank, suit });
          }
        }

        const shuffle = <T,>(arr: T[]): T[] => {
          const a = [...arr];
          for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
          }
          return a;
        };

        const shuffledCards = shuffle(allCards);
        const newItems: OwnedCardSkin[] = [];

        for (let i = 0; i < pack.cardsPerPack; i++) {
          const card = shuffledCards[i % shuffledCards.length];
          const skinId = pack.skinPool[Math.floor(Math.random() * pack.skinPool.length)];
          const cardKey = `${card.rank}-${card.suit}`;
          newItems.push({ cardKey, rank: card.rank, suit: card.suit, skinId });
        }

        set((state) => ({
          player: { ...state.player, gold: state.player.gold - pack.priceGold },
          ownedCardItems: [...state.ownedCardItems, ...newItems],
        }));

        return { success: true, message: 'Pack opened!', cards: newItems };
      },

      setCardSkin: (cardKey: string, skinId: string | null) => {
        set((state) => {
          const next = { ...state.deckCustomization };
          if (skinId === null) {
            delete next[cardKey];
          } else {
            next[cardKey] = skinId;
          }
          return { deckCustomization: next };
        });
      },

      addGold: (amount: number) =>
        set((state) => ({ player: { ...state.player, gold: state.player.gold + amount } })),

      addGems: (amount: number) =>
        set((state) => ({ player: { ...state.player, gems: state.player.gems + amount } })),

      addXP: (amount: number) => {
        const { player } = get();
        const newXP = player.xp + amount;
        const leveled = newXP >= player.xpToNext;
        set((state) => ({
          player: {
            ...state.player,
            xp: leveled ? newXP - state.player.xpToNext : newXP,
            level: leveled ? state.player.level + 1 : state.player.level,
            xpToNext: leveled ? Math.floor(state.player.xpToNext * 1.3) : state.player.xpToNext,
          },
        }));
      },

      recordWin: (mode?: ArenaMode) =>
        set((state) => ({
          player: {
            ...state.player,
            wins: state.player.wins + 1,
            streak: state.player.streak + 1,
            elo: mode ? state.player.elo : state.player.elo + 25,
            eloDuel: mode === 'duel' ? state.player.eloDuel + 25 : state.player.eloDuel,
            eloPoker3: mode === 'poker3' ? state.player.eloPoker3 + 40 : state.player.eloPoker3,
            eloPoker5: mode === 'poker5' ? state.player.eloPoker5 + 60 : state.player.eloPoker5,
          },
        })),

      recordLoss: (mode?: ArenaMode) =>
        set((state) => ({
          player: {
            ...state.player,
            losses: state.player.losses + 1,
            streak: 0,
            elo: mode ? state.player.elo : Math.max(800, state.player.elo - 20),
            eloDuel: mode === 'duel' ? Math.max(800, state.player.eloDuel - 20) : state.player.eloDuel,
            eloPoker3: mode === 'poker3' ? Math.max(800, state.player.eloPoker3 - 25) : state.player.eloPoker3,
            eloPoker5: mode === 'poker5' ? Math.max(800, state.player.eloPoker5 - 35) : state.player.eloPoker5,
          },
        })),

      updateElo: (mode: ArenaMode, delta: number) =>
        set((state) => ({
          player: {
            ...state.player,
            eloDuel: mode === 'duel' ? Math.max(800, state.player.eloDuel + delta) : state.player.eloDuel,
            eloPoker3: mode === 'poker3' ? Math.max(800, state.player.eloPoker3 + delta) : state.player.eloPoker3,
            eloPoker5: mode === 'poker5' ? Math.max(800, state.player.eloPoker5 + delta) : state.player.eloPoker5,
          },
        })),

      completeStage: (regionId: string, stageId: number, stars: number) => {
        const key = `${regionId}-${stageId}`;
        set((state) => ({
          adventureProgress: {
            ...state.adventureProgress,
            [key]: {
              completed: true,
              stars: Math.max(stars, state.adventureProgress[key]?.stars ?? 0),
            },
          },
        }));
      },

      completeExercise: (exerciseId: string, stars: number, score: number) => {
        set((state) => ({
          exerciseProgress: {
            ...state.exerciseProgress,
            [exerciseId]: {
              stars: Math.max(stars, state.exerciseProgress[exerciseId]?.stars ?? 0),
              bestScore: Math.max(score, state.exerciseProgress[exerciseId]?.bestScore ?? 0),
              timesPlayed: (state.exerciseProgress[exerciseId]?.timesPlayed ?? 0) + 1,
            },
          },
        }));
      },

      completeTier: (tierId: TierID, stars: number, score: number) => {
        set((state) => ({
          tierProgress: {
            ...state.tierProgress,
            [tierId]: {
              stars: Math.max(stars, state.tierProgress[tierId]?.stars ?? 0),
              bestScore: Math.max(score, state.tierProgress[tierId]?.bestScore ?? 0),
              timesPlayed: (state.tierProgress[tierId]?.timesPlayed ?? 0) + 1,
            },
          },
        }));
      },
    }),
    { name: 'gto-hunter-player', version: 2 }
  )
);
