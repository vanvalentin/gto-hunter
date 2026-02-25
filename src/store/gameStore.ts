import { create } from 'zustand';
import type { Card, Decision, TierID } from '../types';

export interface GameStore {
  activeTier: TierID;
  activeExerciseIdx: number;
  street: number;
  pot: number;
  oppBet: number;
  communityCards: Card[];
  betSize: number;
  showInsight: boolean;
  decision: Decision | null;
  totalEV: number;
  handCount: number;
  accuracy: number;
  correctDecisions: number;
  totalDecisions: number;

  setActiveTier: (tier: TierID) => void;
  setActiveExerciseIdx: (idx: number) => void;
  setStreet: (v: number) => void;
  setPot: (v: number) => void;
  setOppBet: (v: number) => void;
  setCommunityCards: (v: Card[]) => void;
  setBetSize: (v: number) => void;
  setShowInsight: (v: boolean) => void;
  setDecision: (v: Decision | null) => void;
  recordDecision: (isOptimal: boolean, ev: number) => void;
  reset: (tier?: TierID) => void;
}

const initialState = {
  activeTier: 'novice' as TierID,
  activeExerciseIdx: 0,
  street: 0,
  pot: 24,
  oppBet: 12,
  communityCards: [
    { rank: 'K', suit: 's' as const },
    { rank: '10', suit: 'h' as const },
    { rank: '4', suit: 'c' as const },
  ],
  betSize: 36,
  showInsight: false,
  decision: null,
  totalEV: 0,
  handCount: 0,
  accuracy: 0,
  correctDecisions: 0,
  totalDecisions: 0,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setActiveTier: (tier) => set({ activeTier: tier }),
  setActiveExerciseIdx: (idx) => set({ activeExerciseIdx: idx }),
  setStreet: (v) => set({ street: v }),
  setPot: (v) => set({ pot: v }),
  setOppBet: (v) => set({ oppBet: v }),
  setCommunityCards: (v) => set({ communityCards: v }),
  setBetSize: (v) => set({ betSize: v }),
  setShowInsight: (v) => set({ showInsight: v }),
  setDecision: (v) => set({ decision: v }),

  recordDecision: (isOptimal: boolean, ev: number) =>
    set((state) => {
      const correct = state.correctDecisions + (isOptimal ? 1 : 0);
      const total = state.totalDecisions + 1;
      return {
        totalEV: state.totalEV + ev,
        correctDecisions: correct,
        totalDecisions: total,
        accuracy: Math.round((correct / total) * 100),
      };
    }),

  reset: (tier?: TierID) =>
    set((state) => ({
      ...initialState,
      activeTier: tier ?? state.activeTier,
    })),
}));
