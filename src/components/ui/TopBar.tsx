import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu, X, Home, BookOpen, Swords, ShoppingBag, User, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '../../store/playerStore';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  showCurrency?: boolean;
}

const NAV_LINKS = [
  { path: '/',          icon: Home,        label: 'Hub',       color: '#ffb700' },
  { path: '/learn',     icon: BookOpen,    label: 'Training',  color: '#4a90e2' },
  { path: '/adventure', icon: Swords,      label: 'Adventure', color: '#3a8a4a' },
  { path: '/arena',     icon: Trophy,      label: 'Arena PvP', color: '#e63946' },
  { path: '/shop',      icon: ShoppingBag, label: 'Card Shop', color: '#e8622a' },
  { path: '/profile',   icon: User,        label: 'Profile',   color: '#a855f7' },
];

export function TopBar({ title, showBack = false, showCurrency = true }: TopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { player } = usePlayerStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-3 py-2 z-30 relative"
        style={{ background: '#0f2219', borderBottom: '3px solid rgba(0,0,0,0.4)' }}>

        {/* Left: back or logo */}
        <div className="flex items-center gap-2 min-w-[80px]">
          {showBack ? (
            <button onClick={() => navigate(-1)}
              className="btn-balatro btn-dark px-3 py-1.5 flex items-center gap-1.5 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="font-pixel text-[10px]">Back</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-xl" style={{ color: '#ffb700' }}>♠</span>
              <span className="font-pixel text-xs hidden sm:block" style={{ color: '#ffb700' }}>GTO</span>
            </div>
          )}
        </div>

        {/* Center: title */}
        {title && (
          <h1 className="font-pixel text-xs absolute left-1/2 -translate-x-1/2" style={{ color: '#fff5d6' }}>
            {title}
          </h1>
        )}

        {/* Right: currency + hamburger */}
        <div className="flex items-center gap-2">
          {showCurrency && (
            <>
              <div className="chip-box px-2 py-1 text-xs flex items-center gap-1">
                🪙 <span>{player.gold.toLocaleString()}</span>
              </div>
              <div className="mult-box px-2 py-1 text-xs flex items-center gap-1">
                💎 <span>{player.gems}</span>
              </div>
            </>
          )}
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn-balatro btn-dark w-9 h-9 flex items-center justify-center cursor-pointer ml-1"
          >
            <Menu className="w-4 h-4" style={{ color: '#fff5d6' }} />
          </button>
        </div>
      </header>

      {/* Nav Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 h-full w-72 z-50 flex flex-col"
              style={{ background: '#0f2219', borderLeft: '3px solid rgba(0,0,0,0.5)', boxShadow: '-8px 0 30px rgba(0,0,0,0.6)' }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '3px solid rgba(0,0,0,0.4)' }}>
                <div className="flex items-center gap-2">
                  <img src={player.avatar} alt="avatar"
                    className="w-9 h-9 rounded object-cover"
                    style={{ border: '2px solid #ffb700', boxShadow: '2px 2px 0 #b88a00' }} />
                  <div>
                    <p className="font-pixel text-xs" style={{ color: '#ffb700' }}>{player.username}</p>
                    <p className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.4)' }}>
                      Lv.{player.level} · ELO {player.elo}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="btn-balatro btn-dark w-8 h-8 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" style={{ color: '#fff5d6' }} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                {NAV_LINKS.map(({ path, icon: Icon, label, color }) => {
                  const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
                  return (
                    <button
                      key={path}
                      onClick={() => { navigate(path); setDrawerOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded cursor-pointer text-left transition-all"
                      style={{
                        background: active ? `${color}18` : 'rgba(255,255,255,0.02)',
                        border: `2px solid ${active ? color + '50' : 'rgba(255,255,255,0.06)'}`,
                        boxShadow: active ? `2px 2px 0 rgba(0,0,0,0.3)` : 'none',
                      }}
                    >
                      <div className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                        style={{ background: `${color}20`, border: `2px solid ${color}40` }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <span className="font-pixel text-sm" style={{ color: active ? color : '#fff5d6' }}>
                        {label}
                      </span>
                      {active && (
                        <span className="ml-auto font-pixel text-[10px]" style={{ color }}>◀</span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Currency footer */}
              <div className="p-3 flex gap-2"
                style={{ borderTop: '3px solid rgba(0,0,0,0.4)' }}>
                <div className="chip-box px-3 py-2 text-sm flex items-center gap-2 flex-1 justify-center">
                  🪙 {player.gold.toLocaleString()}
                </div>
                <div className="mult-box px-3 py-2 text-sm flex items-center gap-2 flex-1 justify-center">
                  💎 {player.gems}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
