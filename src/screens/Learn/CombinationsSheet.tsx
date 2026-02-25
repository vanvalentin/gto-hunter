import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { PlayingCard } from '../../components/cards/PlayingCard';
import type { Suit } from '../../types';

interface HandRank {
  name: string;
  description: string;
  cards: { rank: string; suit: Suit }[];
  color: string;
  border: string;
}

const HAND_RANKINGS: HandRank[] = [
  {
    name: 'Royal Flush',
    description: 'A K Q J T of the same suit — unbeatable',
    cards: [
      { rank: 'A', suit: 's' }, { rank: 'K', suit: 's' }, { rank: 'Q', suit: 's' },
      { rank: 'J', suit: 's' }, { rank: 'T', suit: 's' },
    ],
    color: '#ffb700', border: '#b88a00',
  },
  {
    name: 'Straight Flush',
    description: 'Five consecutive cards, same suit',
    cards: [
      { rank: '8', suit: 'c' }, { rank: '7', suit: 'c' }, { rank: '6', suit: 'c' },
      { rank: '5', suit: 'c' }, { rank: '4', suit: 'c' },
    ],
    color: '#c084fc', border: '#7e22ce',
  },
  {
    name: 'Four of a Kind',
    description: 'All four cards of the same rank',
    cards: [
      { rank: 'A', suit: 's' }, { rank: 'A', suit: 'h' },
      { rank: 'A', suit: 'd' }, { rank: 'A', suit: 'c' }, { rank: 'K', suit: 's' },
    ],
    color: '#e8622a', border: '#a04018',
  },
  {
    name: 'Full House',
    description: 'Three of a Kind + a Pair',
    cards: [
      { rank: 'K', suit: 's' }, { rank: 'K', suit: 'h' }, { rank: 'K', suit: 'd' },
      { rank: 'Q', suit: 'c' }, { rank: 'Q', suit: 's' },
    ],
    color: '#4ade80', border: '#15803d',
  },
  {
    name: 'Flush',
    description: 'Five cards of the same suit, any ranks',
    cards: [
      { rank: 'A', suit: 'h' }, { rank: 'J', suit: 'h' }, { rank: '8', suit: 'h' },
      { rank: '6', suit: 'h' }, { rank: '2', suit: 'h' },
    ],
    color: '#60a5fa', border: '#1a4d8a',
  },
  {
    name: 'Straight',
    description: 'Five consecutive cards, any suits',
    cards: [
      { rank: '9', suit: 's' }, { rank: '8', suit: 'h' }, { rank: '7', suit: 'd' },
      { rank: '6', suit: 'c' }, { rank: '5', suit: 's' },
    ],
    color: '#4a90e2', border: '#1a4d8a',
  },
  {
    name: 'Three of a Kind',
    description: 'Three cards of the same rank',
    cards: [
      { rank: '7', suit: 's' }, { rank: '7', suit: 'h' }, { rank: '7', suit: 'd' },
      { rank: 'K', suit: 'c' }, { rank: '2', suit: 's' },
    ],
    color: '#3a8a4a', border: '#1d5c2a',
  },
  {
    name: 'Two Pair',
    description: 'Two different pairs',
    cards: [
      { rank: 'A', suit: 's' }, { rank: 'A', suit: 'h' },
      { rank: 'K', suit: 'd' }, { rank: 'K', suit: 'c' }, { rank: 'Q', suit: 's' },
    ],
    color: '#94a3b8', border: '#475569',
  },
  {
    name: 'One Pair',
    description: 'Two cards of the same rank',
    cards: [
      { rank: 'Q', suit: 's' }, { rank: 'Q', suit: 'h' },
      { rank: 'J', suit: 'd' }, { rank: '7', suit: 'c' }, { rank: '3', suit: 's' },
    ],
    color: '#78716c', border: '#44403c',
  },
  {
    name: 'High Card',
    description: 'No combination — highest card plays',
    cards: [
      { rank: 'A', suit: 's' }, { rank: 'J', suit: 'h' }, { rank: '8', suit: 'd' },
      { rank: '5', suit: 'c' }, { rank: '2', suit: 'h' },
    ],
    color: '#64748b', border: '#334155',
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CombinationsSheet({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)' }}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl flex flex-col"
            style={{
              background: '#0f2219',
              border: '3px solid rgba(122,79,42,0.6)',
              borderBottom: 'none',
              maxHeight: '90dvh',
            }}
          >
            {/* Handle + header */}
            <div className="shrink-0 px-4 pt-3 pb-3" style={{ borderBottom: '2px solid rgba(0,0,0,0.35)' }}>
              <div className="w-10 h-1.5 rounded-full mx-auto mb-3" style={{ background: 'rgba(255,245,214,0.15)' }} />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-pixel text-base" style={{ color: '#ffb700', textShadow: '2px 2px 0 #8a6000' }}>
                    Hand Rankings
                  </h2>
                  <p className="font-pixel text-[9px] mt-0.5" style={{ color: 'rgba(255,245,214,0.4)' }}>
                    Strongest → Weakest
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-lg flex items-center justify-center btn-balatro btn-dark"
                >
                  <X className="w-4 h-4" style={{ color: 'rgba(255,245,214,0.7)' }} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Scrollable list */}
            <div className="overflow-y-auto flex-1 px-3 py-3 flex flex-col gap-2">
              {HAND_RANKINGS.map((hand, i) => (
                <motion.div
                  key={hand.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="balatro-panel p-3"
                  style={{ border: `2px solid ${hand.border}` }}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank number */}
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center shrink-0 font-pixel text-sm"
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: `2px solid ${hand.border}`,
                        color: hand.color,
                      }}
                    >
                      {i + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-pixel text-xs leading-none" style={{ color: hand.color }}>
                        {hand.name}
                      </p>
                      <p className="font-pixel text-[9px] mt-0.5" style={{ color: 'rgba(255,245,214,0.45)' }}>
                        {hand.description}
                      </p>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="flex justify-center gap-1 mt-2.5">
                    {hand.cards.map((card, ci) => (
                      <PlayingCard
                        key={ci}
                        rank={card.rank}
                        suit={card.suit}
                        size="sm"
                      />
                    ))}
                  </div>
                </motion.div>
              ))}

              <div className="h-4 shrink-0" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
