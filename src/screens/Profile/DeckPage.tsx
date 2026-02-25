import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw } from 'lucide-react';
import { TopBar } from '../../components/ui/TopBar';
import { PlayingCard } from '../../components/cards/PlayingCard';
import { usePlayerStore, AVAILABLE_SKINS } from '../../store/playerStore';
import type { Suit, OwnedCardSkin } from '../../types';

const ALL_RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
const SUITS: { id: Suit; symbol: string; label: string; color: string }[] = [
  { id: 's', symbol: '♠', label: 'Spades',   color: '#fff5d6' },
  { id: 'h', symbol: '♥', label: 'Hearts',   color: '#e63946' },
  { id: 'd', symbol: '♦', label: 'Diamonds', color: '#e63946' },
  { id: 'c', symbol: '♣', label: 'Clubs',    color: '#fff5d6' },
];

const RARITY_COLORS: Record<string, string> = {
  common:    '#9ca3af',
  rare:      '#4a90e2',
  epic:      '#a855f7',
  legendary: '#ffb700',
};

interface SkinPickerProps {
  cardKey: string;
  rank: string;
  suit: Suit;
  onClose: () => void;
}

function SkinPickerModal({ cardKey, rank, suit, onClose }: SkinPickerProps) {
  const { ownedCardItems, deckCustomization, setCardSkin, equippedSkin, skins } = usePlayerStore();
  const currentSkinId = deckCustomization[cardKey] ?? null;

  // All skin IDs available for this specific card from pack items
  const availableSkinIds = [
    ...new Set(
      ownedCardItems
        .filter((item) => item.cardKey === cardKey)
        .map((item) => item.skinId)
    ),
  ];

  const availableSkins = availableSkinIds
    .map((id) => skins.find((s) => s.id === id))
    .filter(Boolean) as typeof skins;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="fixed inset-x-2 bottom-0 z-50 rounded-t-xl overflow-hidden max-w-sm mx-auto"
        style={{ background: '#0f2219', border: '3px solid #4a90e2', borderBottom: 'none', boxShadow: '0 -8px 30px rgba(74,144,226,0.2)' }}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '2px solid rgba(0,0,0,0.4)' }}>
          <div>
            <h3 className="font-pixel text-sm" style={{ color: '#4a90e2' }}>
              {rank}{suit === 'h' || suit === 'd' ? '♥♦'[suit === 'd' ? 1 : 0] : suit === 's' ? '♠' : '♣'} Choose Skin
            </h3>
            <p className="font-pixel text-[9px] mt-0.5" style={{ color: 'rgba(255,245,214,0.4)' }}>
              {availableSkins.length} skin{availableSkins.length !== 1 ? 's' : ''} available from packs
            </p>
          </div>
          <button onClick={onClose} className="btn-balatro btn-dark w-8 h-8 flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4" style={{ color: '#fff5d6' }} />
          </button>
        </div>

        <div className="p-4 pb-8 overflow-y-auto max-h-[60vh]">
          {availableSkins.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-pixel text-sm mb-2" style={{ color: 'rgba(255,245,214,0.4)' }}>No skins collected</p>
              <p className="font-pixel text-[10px]" style={{ color: 'rgba(255,245,214,0.25)' }}>
                Buy card packs in the Shop to get skins for this card.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Default / global skin option */}
              <button
                onClick={() => { setCardSkin(cardKey, null); onClose(); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
                style={{
                  background: currentSkinId === null ? 'rgba(74,144,226,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${currentSkinId === null ? '#4a90e2' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <PlayingCard rank={rank} suit={suit} skin={equippedSkin} size="sm" />
                <div className="flex-1 text-left">
                  <p className="font-pixel text-xs" style={{ color: '#fff5d6' }}>Global Skin</p>
                  <p className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.4)' }}>
                    Use {equippedSkin.name} (default)
                  </p>
                </div>
                {currentSkinId === null && (
                  <div className="w-4 h-4 rounded-full" style={{ background: '#4a90e2' }} />
                )}
              </button>

              {availableSkins.map((skin) => {
                const isActive = currentSkinId === skin.id;
                const rarityColor = RARITY_COLORS[skin.rarity] ?? '#9ca3af';
                return (
                  <button
                    key={skin.id}
                    onClick={() => { setCardSkin(cardKey, skin.id); onClose(); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
                    style={{
                      background: isActive ? `${rarityColor}15` : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${isActive ? rarityColor : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <PlayingCard rank={rank} suit={suit} skin={skin} size="sm" />
                    <div className="flex-1 text-left">
                      <p className="font-pixel text-xs" style={{ color: '#fff5d6' }}>{skin.name}</p>
                      <p className="font-pixel text-[9px] capitalize" style={{ color: rarityColor }}>
                        {skin.rarity}
                      </p>
                    </div>
                    {isActive && (
                      <div className="w-4 h-4 rounded-full" style={{ background: rarityColor }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

export function DeckScreen() {
  const { deckCustomization, ownedCardItems, equippedSkin, skins, setCardSkin } = usePlayerStore();
  const [activeSuit, setActiveSuit] = useState<Suit>('s');
  const [selectedCard, setSelectedCard] = useState<{ rank: string; suit: Suit; key: string } | null>(null);

  const customizedCount = Object.keys(deckCustomization).length;

  const getCardSkin = (cardKey: string) => {
    const skinId = deckCustomization[cardKey];
    if (skinId) {
      const skin = skins.find((s) => s.id === skinId);
      if (skin) return skin;
    }
    return equippedSkin;
  };

  const hasCollectedSkins = (cardKey: string) => {
    return ownedCardItems.some((item) => item.cardKey === cardKey);
  };

  const isCustomized = (cardKey: string) => !!deckCustomization[cardKey];

  const resetAll = () => {
    Object.keys(deckCustomization).forEach((key) => setCardSkin(key, null));
  };

  return (
    <div className="min-h-screen flex flex-col felt-dark-bg">
      <TopBar title="My Deck" showBack showCurrency />

      {/* Summary bar */}
      <div className="px-4 py-2.5 flex items-center justify-between"
        style={{ background: '#0f2219', borderBottom: '2px solid rgba(0,0,0,0.4)' }}>
        <p className="font-pixel text-[10px]" style={{ color: 'rgba(255,245,214,0.5)' }}>
          {customizedCount} / 52 customized
        </p>
        {customizedCount > 0 && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1 font-pixel text-[9px] px-2 py-1 btn-balatro btn-dark cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset all
          </button>
        )}
      </div>

      {/* Suit tabs */}
      <div className="flex px-4 pt-2 gap-1"
        style={{ background: '#0f2219', borderBottom: '2px solid rgba(0,0,0,0.4)' }}>
        {SUITS.map((suit) => {
          const suitCards = ALL_RANKS.map((r) => `${r}-${suit.id}`);
          const customized = suitCards.filter((k) => isCustomized(k)).length;
          return (
            <button
              key={suit.id}
              onClick={() => setActiveSuit(suit.id)}
              className={`flex-1 pb-2 flex flex-col items-center gap-0.5 border-b-2 transition-all cursor-pointer ${activeSuit === suit.id ? 'border-current' : 'border-transparent'}`}
              style={{ color: activeSuit === suit.id ? suit.color : 'rgba(255,245,214,0.3)' }}
            >
              <span className="text-lg leading-none">{suit.symbol}</span>
              <span className="font-pixel text-[7px]">{suit.label}</span>
              {customized > 0 && (
                <span className="font-pixel text-[6px] px-1 rounded"
                  style={{ background: '#4a90e240', color: '#4a90e2' }}>
                  {customized}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Card grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSuit}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-4 gap-2.5 sm:grid-cols-5"
          >
            {ALL_RANKS.map((rank, i) => {
              const cardKey = `${rank}-${activeSuit}`;
              const skin = getCardSkin(cardKey);
              const hasItems = hasCollectedSkins(cardKey);
              const customized = isCustomized(cardKey);

              return (
                <motion.button
                  key={cardKey}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedCard({ rank, suit: activeSuit, key: cardKey })}
                  className="flex flex-col items-center gap-1.5 relative cursor-pointer"
                >
                  <div className="relative">
                    <PlayingCard rank={rank} suit={activeSuit} skin={skin} size="sm" />
                    {customized && (
                      <div
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{ background: RARITY_COLORS[skin.rarity] ?? '#4a90e2', border: '1.5px solid #0f2219' }}
                      />
                    )}
                    {!hasItems && !customized && (
                      <div className="absolute inset-0 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.45)' }}>
                        <span className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.35)' }}>—</span>
                      </div>
                    )}
                  </div>
                  <span className="font-pixel text-[8px]" style={{ color: customized ? skin.glowColor : 'rgba(255,245,214,0.4)' }}>
                    {rank}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#4a90e2' }} />
            <span className="font-pixel text-[8px]" style={{ color: 'rgba(255,245,214,0.4)' }}>Customized</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="font-pixel text-[6px]" style={{ color: 'rgba(255,245,214,0.35)' }}>—</span>
            </div>
            <span className="font-pixel text-[8px]" style={{ color: 'rgba(255,245,214,0.4)' }}>No skins (buy packs!)</span>
          </div>
        </div>
      </div>

      {/* Skin picker modal */}
      <AnimatePresence>
        {selectedCard && (
          <SkinPickerModal
            cardKey={selectedCard.key}
            rank={selectedCard.rank}
            suit={selectedCard.suit}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
