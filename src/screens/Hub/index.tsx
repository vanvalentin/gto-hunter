import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Swords, Trophy, ShoppingBag, Flame, User } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

const MENU_ITEMS = [
  { path: '/learn',     label: 'Training Grounds', sub: 'Learn GTO fundamentals',     btnClass: 'btn-blue',   icon: BookOpen    },
  { path: '/adventure', label: 'Adventure',         sub: 'Campaign vs AI opponents',   btnClass: 'btn-green',  icon: Swords      },
  { path: '/arena',     label: 'Arena PvP',         sub: 'Ranked live matches',        btnClass: 'btn-red',    icon: Trophy      },
  { path: '/shop',      label: 'Card Shop',         sub: 'Collect rare card skins',    btnClass: 'btn-orange', icon: ShoppingBag },
  { path: '/profile',   label: 'Profile',           sub: 'Stats, achievements, skins', btnClass: 'btn-dark',   icon: User        },
];

export function HubScreen() {
  const navigate = useNavigate();
  const { player } = usePlayerStore();
  const xpPct = Math.round((player.xp / player.xpToNext) * 100);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden felt-bg">
      {/* Header */}
      <header className="relative z-10 px-4" style={{ paddingTop: '18px', paddingBottom: '18px', height: 'fit-content' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl balatro-panel"
              style={{ border: '3px solid #ffb700', boxShadow: '3px 3px 0 #b88a00, 0 0 12px rgba(255,183,0,0.3)', background: '#1a0f08' }}>
              ♠
            </div>
            <div>
              <h1 className="font-pixel text-xl leading-none" style={{ color: '#ffb700', textShadow: '2px 2px 0 #8a6000' }}>
                GTO HUNTER
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,245,214,0.5)', fontFamily: 'Pixelify Sans' }}>
                Poker Strategy Game
              </p>
            </div>
          </div>

          {/* Currency */}
          <div className="flex gap-2">
            <div className="chip-box px-3 py-1.5 text-sm flex items-center gap-1.5">
              🪙 <span>{player.gold.toLocaleString()}</span>
            </div>
            <div className="mult-box px-3 py-1.5 text-sm flex items-center gap-1.5">
              💎 <span>{player.gems}</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Player info panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-4 mb-4 p-3 balatro-panel"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={player.avatar} alt="Avatar"
              className="w-14 h-14 rounded-lg object-cover"
              style={{ border: '3px solid #ffb700', boxShadow: '3px 3px 0 #b88a00' }} />
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded flex items-center justify-center text-xs font-pixel"
              style={{ background: '#cc2936', border: '2px solid #8a1920', boxShadow: '2px 2px 0 #8a1920', color: 'white' }}>
              {player.level}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-sm" style={{ color: '#ffb700' }}>{player.username}</span>
              {player.streak > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                  style={{ background: '#3a1a00', border: '2px solid #e8622a', boxShadow: '2px 2px 0 #a04018' }}>
                  <Flame className="w-3 h-3" style={{ color: '#e8622a' }} />
                  <span className="text-[10px] font-pixel" style={{ color: '#e8622a' }}>{player.streak}</span>
                </div>
              )}
            </div>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,245,214,0.5)', fontFamily: 'Pixelify Sans' }}>
              ELO {player.elo} · {player.wins}W {player.losses}L
            </p>
            {/* XP bar */}
            <div className="mt-2 w-full h-3 rounded overflow-hidden" style={{ background: '#0f2219', border: '2px solid #1d3a27' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="h-full"
                style={{ background: 'linear-gradient(90deg, #2563eb, #4a90e2)' }}
              />
            </div>
            <p className="text-[9px] mt-0.5 font-pixel" style={{ color: 'rgba(255,245,214,0.4)' }}>
              {player.xp}/{player.xpToNext} XP — Level {player.level}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Menu items */}
      <div className="px-4 flex flex-col gap-3">
        {MENU_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.1 }}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 p-3 cursor-pointer text-left balatro-panel btn-balatro"
              style={{ fontFamily: 'inherit', textTransform: 'none', letterSpacing: 'normal' }}
              whileHover={{ x: 4 }}
              whileTap={{ x: 2, y: 2, boxShadow: 'none' }}
            >
              <div className={`w-11 h-11 rounded flex items-center justify-center shrink-0 ${item.btnClass}`}
                style={{ minWidth: 44 }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-sm leading-none" style={{ color: '#fff5d6' }}>{item.label}</span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,245,214,0.5)', fontFamily: 'Pixelify Sans' }}>{item.sub}</p>
              </div>
              <span className="text-lg font-pixel" style={{ color: 'rgba(255,245,214,0.3)' }}>›</span>
            </motion.button>
          );
        })}
      </div>

      {/* Wide promo banner */}
      <div className="px-4 pb-6 pt-3">
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/shop')}
          className="w-full overflow-hidden rounded-xl cursor-pointer block"
          style={{
            border: '3px solid rgba(255,183,0,0.35)',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.4), 0 0 18px rgba(255,183,0,0.12)',
            background: 'none',
            padding: 0,
          }}
        >
          <img
            src="/banner-knight-kingdoms-wide.png"
            alt="A Knight of the Seven Kingdoms – New Deck Available Now"
            className="w-full block"
            style={{ aspectRatio: '1058 / 275', objectFit: 'cover' }}
          />
        </motion.button>
      </div>
    </div>
  );
}
