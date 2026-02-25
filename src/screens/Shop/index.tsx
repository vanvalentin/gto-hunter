import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Sparkles, Package } from 'lucide-react';
import { TopBar } from '../../components/ui/TopBar';
import { PlayingCard } from '../../components/cards/PlayingCard';
import { ChipDisplay, ChipSkinPreview, PokerChip } from '../../components/ui/ChipDisplay';
import { usePlayerStore, AVAILABLE_SKINS, AVAILABLE_CHIP_SKINS, AVAILABLE_CARD_PACKS } from '../../store/playerStore';
import type { CardSkin, ChipSkin, SkinRarity, OwnedCardSkin, Suit } from '../../types';

const RARITY_COLORS: Record<SkinRarity, { color: string; border: string; shadow: string; label: string }> = {
  common:    { color: '#9ca3af', border: '#4b5563', shadow: '#374151', label: 'Common' },
  rare:      { color: '#4a90e2', border: '#1a4d8a', shadow: '#1a3d6a', label: 'Rare' },
  epic:      { color: '#a855f7', border: '#6b21a8', shadow: '#3b0764', label: 'Epic' },
  legendary: { color: '#ffb700', border: '#b88a00', shadow: '#8a6000', label: 'Legendary' },
};

type ShopTab = 'cards' | 'chips' | 'packs';

/* ─── Card skin components ─────────────────────────────── */

function CardSkinCard({ skin, onClick }: { skin: CardSkin; onClick: () => void }) {
  const r = RARITY_COLORS[skin.rarity];
  return (
    <motion.button whileHover={{ y: -3 }} whileTap={{ y: 1, scale: 0.97 }}
      onClick={onClick}
      className="p-3 cursor-pointer text-left balatro-panel flex flex-col items-center gap-2 relative"
      style={{ border: `3px solid ${skin.owned ? r.color : 'rgba(255,255,255,0.08)'}`, boxShadow: skin.equipped ? `4px 4px 0 ${r.shadow}, 0 0 14px ${r.color}50` : '4px 4px 0 rgba(0,0,0,0.4)' }}
    >
      {skin.equipped && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center"
          style={{ background: r.color, border: `2px solid ${r.border}`, boxShadow: `1px 1px 0 ${r.shadow}` }}>
          <Check className="w-3 h-3" style={{ color: skin.rarity === 'legendary' ? '#1a0f08' : 'white' }} strokeWidth={3} />
        </div>
      )}
      {/* Back + face side by side */}
      <div className="flex items-end gap-1.5 mt-1">
        <PlayingCard rank="A" suit="s" skin={skin} size="sm" faceDown />
        <PlayingCard rank="A" suit="h" skin={skin} size="sm" />
      </div>
      <div className="w-full text-center">
        <p className="font-pixel text-[10px] leading-tight" style={{ color: '#fff5d6' }}>{skin.name}</p>
        <div className="inline-block mt-1 px-2 py-0.5 rounded font-pixel text-[8px]"
          style={{ background: `${r.color}20`, color: r.color, border: `1px solid ${r.color}40` }}>
          {r.label}
        </div>
        <div className="mt-1 font-pixel text-[10px]" style={{ color: skin.owned ? '#3a8a4a' : '#ffb700' }}>
          {skin.owned ? (skin.equipped ? '✓ On' : 'Owned') : skin.priceGems > 0 ? `💎 ${skin.priceGems}` : `🪙 ${skin.priceGold.toLocaleString()}`}
        </div>
      </div>
    </motion.button>
  );
}

function CardSkinDetail({ skin, onClose }: { skin: CardSkin; onClose: () => void }) {
  const r = RARITY_COLORS[skin.rarity];
  const { buySkin, equipSkin, player } = usePlayerStore();
  const [msg, setMsg] = useState<string | null>(null);

  const canAfford = skin.priceGems > 0 ? player.gems >= skin.priceGems : player.gold >= skin.priceGold;

  const handleBuy = () => {
    const res = buySkin(skin.id);
    setMsg(res.message);
    if (res.success) setTimeout(onClose, 1200);
    else setTimeout(() => setMsg(null), 2000);
  };

  return (
    <DrawerOverlay onClose={onClose} title={skin.name} rarity={skin.rarity}>
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="flex flex-col items-center gap-3">
          {/* Back (skin design) + face-up side by side */}
          <div className="flex items-end gap-3">
            <div className="flex flex-col items-center gap-1">
              <PlayingCard rank="A" suit="s" skin={skin} size="lg" faceDown />
              <p className="font-pixel text-[8px]" style={{ color: 'rgba(255,245,214,0.4)' }}>Back</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <PlayingCard rank="A" suit="s" skin={skin} size="lg" />
              <p className="font-pixel text-[8px]" style={{ color: 'rgba(255,245,214,0.4)' }}>Face</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(['Q','J','10'] as const).map((rnk, i) => (
              <PlayingCard key={rnk} rank={rnk} suit={(['d','c','s'] as const)[i]} skin={skin} faceDown={i === 2} size="sm" />
            ))}
          </div>
        </div>

        {msg && (
          <div className="w-full py-2 text-center font-pixel text-sm rounded"
            style={{ background: msg === 'Purchased!' ? 'rgba(58,138,74,0.2)' : 'rgba(230,57,70,0.2)', border: `2px solid ${msg === 'Purchased!' ? '#3a8a4a' : '#e63946'}`, color: msg === 'Purchased!' ? '#3a8a4a' : '#e63946' }}>
            {msg}
          </div>
        )}

        {skin.owned ? (
          <button onClick={() => { equipSkin(skin.id); setMsg('Equipped!'); setTimeout(onClose, 800); }}
            disabled={skin.equipped}
            className={`w-full py-3 btn-balatro text-sm ${skin.equipped ? 'btn-dark opacity-60' : 'btn-green'}`}>
            {skin.equipped ? '✓ Currently Equipped' : 'Equip Skin'}
          </button>
        ) : (
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-center">
              {skin.priceGems > 0
                ? <div className="mult-box px-4 py-1.5 font-pixel text-sm">💎 {skin.priceGems} Gems</div>
                : <div className="chip-box px-4 py-1.5 font-pixel text-sm">🪙 {skin.priceGold.toLocaleString()} Gold</div>}
            </div>
            {!canAfford && <p className="text-center font-pixel text-[10px]" style={{ color: '#e63946' }}>Not enough {skin.priceGems > 0 ? 'Gems' : 'Gold'}</p>}
            <button onClick={handleBuy} disabled={!canAfford}
              className={`w-full py-3 btn-balatro btn-gold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed`}>
              <Sparkles className="w-4 h-4" /> Purchase
            </button>
          </div>
        )}
      </div>
    </DrawerOverlay>
  );
}

/* ─── Chip skin components ──────────────────────────────── */

function ChipSkinCard({ skin, onClick }: { skin: ChipSkin; onClick: () => void }) {
  const r = RARITY_COLORS[skin.rarity];
  return (
    <motion.button whileHover={{ y: -3 }} whileTap={{ y: 1, scale: 0.97 }}
      onClick={onClick}
      className="p-3 cursor-pointer text-left balatro-panel flex flex-col items-center gap-2 relative"
      style={{ border: `3px solid ${skin.owned ? r.color : 'rgba(255,255,255,0.08)'}`, boxShadow: skin.equipped ? `4px 4px 0 ${r.shadow}, 0 0 12px ${r.color}40` : '4px 4px 0 rgba(0,0,0,0.4)' }}
    >
      {skin.equipped && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center"
          style={{ background: r.color, border: `2px solid ${r.border}`, boxShadow: `1px 1px 0 ${r.shadow}` }}>
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}
      {/* Circular poker chip */}
      <div className="py-1">
        <PokerChip skin={skin} size={68} />
      </div>
      <div className="w-full text-center">
        <p className="font-pixel text-[10px]" style={{ color: '#fff5d6' }}>{skin.name}</p>
        <div className="inline-block mt-1 px-2 py-0.5 rounded font-pixel text-[8px]"
          style={{ background: `${r.color}20`, color: r.color, border: `1px solid ${r.color}40` }}>
          {r.label}
        </div>
        <div className="mt-1 font-pixel text-[10px]" style={{ color: skin.owned ? '#3a8a4a' : '#ffb700' }}>
          {skin.owned ? (skin.equipped ? '✓ On' : 'Owned') : skin.priceGems > 0 ? `💎 ${skin.priceGems}` : `🪙 ${skin.priceGold.toLocaleString()}`}
        </div>
      </div>
    </motion.button>
  );
}

function ChipSkinDetail({ skin, onClose }: { skin: ChipSkin; onClose: () => void }) {
  const { buyChipSkin, equipChipSkin, player } = usePlayerStore();
  const [msg, setMsg] = useState<string | null>(null);
  const canAfford = skin.priceGems > 0 ? player.gems >= skin.priceGems : player.gold >= skin.priceGold;

  const handleBuy = () => {
    const res = buyChipSkin(skin.id);
    setMsg(res.message);
    if (res.success) setTimeout(onClose, 1200);
    else setTimeout(() => setMsg(null), 2000);
  };

  return (
    <DrawerOverlay onClose={onClose} title={skin.name} rarity={skin.rarity}>
      <div className="flex flex-col items-center gap-4 py-2">
        <ChipSkinPreview skin={skin} />

        {msg && (
          <div className="w-full py-2 text-center font-pixel text-sm rounded"
            style={{ background: msg === 'Purchased!' ? 'rgba(58,138,74,0.2)' : 'rgba(230,57,70,0.2)', border: `2px solid ${msg === 'Purchased!' ? '#3a8a4a' : '#e63946'}`, color: msg === 'Purchased!' ? '#3a8a4a' : '#e63946' }}>
            {msg}
          </div>
        )}

        {skin.owned ? (
          <button onClick={() => { equipChipSkin(skin.id); setMsg('Equipped!'); setTimeout(onClose, 800); }}
            disabled={skin.equipped}
            className={`w-full py-3 btn-balatro text-sm ${skin.equipped ? 'btn-dark opacity-60' : 'btn-green'}`}>
            {skin.equipped ? '✓ Currently Equipped' : 'Equip Chip Skin'}
          </button>
        ) : (
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-center">
              {skin.priceGems > 0
                ? <div className="mult-box px-4 py-1.5 font-pixel text-sm">💎 {skin.priceGems} Gems</div>
                : <div className="chip-box px-4 py-1.5 font-pixel text-sm">🪙 {skin.priceGold.toLocaleString()} Gold</div>}
            </div>
            {!canAfford && <p className="text-center font-pixel text-[10px]" style={{ color: '#e63946' }}>Not enough {skin.priceGems > 0 ? 'Gems' : 'Gold'}</p>}
            <button onClick={handleBuy} disabled={!canAfford}
              className="w-full py-3 btn-balatro btn-gold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              <Sparkles className="w-4 h-4" /> Purchase
            </button>
          </div>
        )}
      </div>
    </DrawerOverlay>
  );
}

/* ─── Shared bottom sheet ───────────────────────────────── */

function DrawerOverlay({ onClose, title, rarity, children }: {
  onClose: () => void; title: string; rarity: SkinRarity; children: React.ReactNode;
}) {
  const r = RARITY_COLORS[rarity];
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="fixed inset-x-2 bottom-0 z-50 rounded-t-xl overflow-hidden max-w-sm mx-auto"
        style={{ background: '#0f2219', border: `3px solid ${r.color}`, borderBottom: 'none', boxShadow: `0 -8px 30px ${r.color}30` }}
      >
        <div className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '2px solid rgba(0,0,0,0.4)' }}>
          <div>
            <h3 className="font-pixel text-base" style={{ color: r.color }}>{title}</h3>
            <span className="font-pixel text-[9px] px-2 py-0.5 rounded inline-block mt-0.5"
              style={{ background: `${r.color}20`, color: r.color, border: `1px solid ${r.color}40` }}>
              {r.label}
            </span>
          </div>
          <button onClick={onClose} className="btn-balatro btn-dark w-8 h-8 flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4" style={{ color: '#fff5d6' }} />
          </button>
        </div>
        <div className="p-4 pb-8 overflow-y-auto max-h-[75vh]">{children}</div>
      </motion.div>
    </>
  );
}

/* ─── Pack opening overlay ──────────────────────────────── */

function PackOpenOverlay({ cards, onClose }: { cards: OwnedCardSkin[]; onClose: () => void }) {
  const { skins } = usePlayerStore();
  const [revealed, setRevealed] = useState(0);

  const getSkin = (skinId: string) => skins.find((s) => s.id === skinId) ?? skins[0];

  React.useEffect(() => {
    if (revealed >= cards.length) return;
    const t = setTimeout(() => setRevealed((r) => r + 1), 600);
    return () => clearTimeout(t);
  }, [revealed, cards.length]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/85 z-40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-xl p-6 max-w-sm mx-auto"
        style={{ background: '#0f2219', border: '3px solid #ffb700', boxShadow: '0 0 40px rgba(255,183,0,0.25)' }}
      >
        <h3 className="font-pixel text-center text-base mb-1" style={{ color: '#ffb700' }}>Pack Opened!</h3>
        <p className="font-pixel text-center text-[10px] mb-5" style={{ color: 'rgba(255,245,214,0.4)' }}>
          You got {cards.length} new cards
        </p>

        <div className="flex justify-center gap-3 mb-5 flex-wrap">
          {cards.map((item, i) => {
            const skin = getSkin(item.skinId);
            const isRevealed = i < revealed;
            return (
              <motion.div
                key={i}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={isRevealed ? { rotateY: 0, opacity: 1 } : { rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex flex-col items-center gap-1"
              >
                <PlayingCard rank={item.rank} suit={item.suit as Suit} skin={skin} size="md" />
                <p className="font-pixel text-[8px] text-center" style={{ color: skin.glowColor }}>{skin.name}</p>
              </motion.div>
            );
          })}
        </div>

        {revealed >= cards.length && (
          <motion.button
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            onClick={onClose}
            className="w-full py-3 btn-balatro btn-green font-pixel text-sm"
          >
            Collect Cards
          </motion.button>
        )}
      </motion.div>
    </>
  );
}

/* ─── Card Packs tab ────────────────────────────────────── */

function CardPacksTab() {
  const { player, buyCardPack } = usePlayerStore();
  const [openedCards, setOpenedCards] = useState<OwnedCardSkin[] | null>(null);
  const [msg, setMsg] = useState<{ packId: string; text: string } | null>(null);

  const handleBuy = (packId: string) => {
    const res = buyCardPack(packId);
    if (res.success && res.cards) {
      setOpenedCards(res.cards);
    } else {
      setMsg({ packId, text: res.message });
      setTimeout(() => setMsg(null), 2000);
    }
  };

  const PACK_COLORS = [
    { border: '#4a90e2', shadow: '#1a3d6a', glow: '#4a90e220', label: 'Common · Rare' },
    { border: '#a855f7', shadow: '#3b0764', glow: '#a855f720', label: 'Rare · Epic' },
    { border: '#ffb700', shadow: '#8a6000', glow: '#ffb70020', label: 'Epic · Legendary' },
  ];

  return (
    <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
      <p className="font-pixel text-[10px] text-center" style={{ color: 'rgba(255,245,214,0.4)' }}>
        Each pack gives 4 random individually skinned cards for your deck.
      </p>

      {AVAILABLE_CARD_PACKS.map((pack, idx) => {
        const col = PACK_COLORS[idx];
        const canAfford = player.gold >= pack.priceGold;
        const isError = msg?.packId === pack.id;
        const previewSkins = pack.skinPool.slice(0, 3).map(
          (sid) => AVAILABLE_SKINS.find((s) => s.id === sid)
        ).filter(Boolean) as CardSkin[];

        return (
          <motion.div
            key={pack.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="balatro-panel p-4 flex flex-col gap-3"
            style={{ border: `3px solid ${col.border}`, boxShadow: `4px 4px 0 ${col.shadow}, 0 0 16px ${col.glow}` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4" style={{ color: col.border }} />
                  <h4 className="font-pixel text-sm" style={{ color: col.border }}>{pack.name}</h4>
                </div>
                <p className="font-pixel text-[10px] leading-relaxed" style={{ color: 'rgba(255,245,214,0.55)' }}>
                  {pack.description}
                </p>
              </div>
              <div className="chip-box px-3 py-1.5 font-pixel text-xs shrink-0">
                🪙 {pack.priceGold.toLocaleString()}
              </div>
            </div>

            {/* Skin previews */}
            <div className="flex items-end gap-2">
              {previewSkins.map((skin) => (
                <div key={skin.id} className="flex flex-col items-center gap-0.5">
                  <PlayingCard rank="A" suit="s" skin={skin} size="sm" faceDown />
                  <p className="font-pixel text-[7px]" style={{ color: 'rgba(255,245,214,0.4)' }}>{skin.name}</p>
                </div>
              ))}
              {pack.skinPool.length > 3 && (
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <div className="w-11 h-16 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.15)' }}>
                    <span className="font-pixel text-[10px]" style={{ color: 'rgba(255,245,214,0.3)' }}>
                      +{pack.skinPool.length - 3}
                    </span>
                  </div>
                </div>
              )}
              <div className="ml-auto flex flex-col items-center gap-0.5">
                <div className="w-11 h-16 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,183,0,0.06)', border: '2px dashed rgba(255,183,0,0.2)' }}>
                  <span className="font-pixel text-lg">🎴</span>
                </div>
                <p className="font-pixel text-[7px]" style={{ color: 'rgba(255,245,214,0.4)' }}>×{pack.cardsPerPack}</p>
              </div>
            </div>

            {isError && (
              <p className="font-pixel text-[10px] text-center py-1 rounded"
                style={{ background: 'rgba(230,57,70,0.15)', color: '#e63946', border: '1px solid #e6394640' }}>
                {msg?.text}
              </p>
            )}

            <button
              onClick={() => handleBuy(pack.id)}
              disabled={!canAfford}
              className="w-full py-2.5 btn-balatro btn-gold font-pixel text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-3.5 h-3.5" /> Open Pack
            </button>
          </motion.div>
        );
      })}

      <AnimatePresence>
        {openedCards && (
          <PackOpenOverlay cards={openedCards} onClose={() => setOpenedCards(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Shop screen ──────────────────────────────────── */

type FilterTab = 'all' | 'owned' | SkinRarity;

export function ShopScreen() {
  const { skins, chipSkins } = usePlayerStore();
  const [tab, setTab] = useState<ShopTab>('cards');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [selectedCard, setSelectedCard] = useState<CardSkin | null>(null);
  const [selectedChip, setSelectedChip] = useState<ChipSkin | null>(null);

  const FILTER_TABS: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'owned', label: 'Owned' },
    { id: 'common', label: 'Common' },
    { id: 'rare', label: 'Rare' },
    { id: 'epic', label: 'Epic' },
    { id: 'legendary', label: '★ Legendary' },
  ];

  const filteredCards = skins.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'owned') return s.owned;
    return s.rarity === filter;
  });

  const filteredChips = chipSkins.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'owned') return s.owned;
    return s.rarity === filter;
  });

  const MAIN_TABS: { id: ShopTab; label: string }[] = [
    { id: 'cards', label: '🃏 Card Skins' },
    { id: 'chips', label: '🔵 Chip Skins' },
    { id: 'packs', label: '🎴 Card Packs' },
  ];

  return (
    <div className="min-h-screen flex flex-col felt-dark-bg">
      <TopBar title="Card Shop" showBack showCurrency />

      {/* Main tab bar */}
      <div className="flex px-4 pt-3 gap-3 overflow-x-auto no-scrollbar" style={{ borderBottom: '2px solid rgba(0,0,0,0.4)', background: '#0f2219' }}>
        {MAIN_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`pb-2 px-1 font-pixel text-xs transition-all cursor-pointer border-b-2 shrink-0 ${tab === t.id ? 'border-[#ffb700]' : 'border-transparent'}`}
            style={{ color: tab === t.id ? '#ffb700' : 'rgba(255,245,214,0.4)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Rarity filter — only for card/chip tabs */}
      {tab !== 'packs' && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar" style={{ background: '#0f2219', borderBottom: '2px solid rgba(0,0,0,0.4)' }}>
          {FILTER_TABS.map(ft => {
            const rc = ft.id !== 'all' && ft.id !== 'owned' ? RARITY_COLORS[ft.id as SkinRarity]?.color : null;
            return (
              <button key={ft.id} onClick={() => setFilter(ft.id)}
                className="shrink-0 px-3 py-1 btn-balatro text-[10px] cursor-pointer"
                style={{
                  background: filter === ft.id ? `${rc ?? '#ffb700'}25` : '#160d05',
                  borderColor: filter === ft.id ? (rc ?? '#ffb700') : 'rgba(255,255,255,0.1)',
                  color: filter === ft.id ? (rc ?? '#ffb700') : 'rgba(255,245,214,0.5)',
                  boxShadow: filter === ft.id ? `2px 2px 0 ${rc ? rc + '60' : '#b88a00'}` : '2px 2px 0 rgba(0,0,0,0.3)',
                }}>
                {ft.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {tab === 'packs' ? (
            <motion.div key="packs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CardPacksTab />
            </motion.div>
          ) : (
            <div className="px-4 pt-4 pb-6">
              <AnimatePresence mode="wait">
                {tab === 'cards' ? (
                  <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {filteredCards.map(s => <CardSkinCard key={s.id} skin={s} onClick={() => setSelectedCard(s)} />)}
                  </motion.div>
                ) : (
                  <motion.div key="chips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {filteredChips.map(s => <ChipSkinCard key={s.id} skin={s} onClick={() => setSelectedChip(s)} />)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail modals */}
      <AnimatePresence>
        {selectedCard && <CardSkinDetail skin={selectedCard} onClose={() => setSelectedCard(null)} />}
        {selectedChip && <ChipSkinDetail skin={selectedChip} onClose={() => setSelectedChip(null)} />}
      </AnimatePresence>
    </div>
  );
}
