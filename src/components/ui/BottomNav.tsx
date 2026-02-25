import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, BookOpen, Swords, ShoppingBag, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/',          icon: Home,        label: 'Hub' },
  { path: '/learn',     icon: BookOpen,    label: 'Learn' },
  { path: '/adventure', icon: Swords,      label: 'Quest' },
  { path: '/shop',      icon: ShoppingBag, label: 'Shop' },
  { path: '/profile',   icon: User,        label: 'Profile' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 pb-safe">
      <div className="mx-auto max-w-sm flex items-center justify-around py-2 px-2 mb-2"
        style={{
          background: '#0f2219',
          borderTop: '3px solid rgba(0,0,0,0.5)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        }}>
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer relative"
            >
              {active && (
                <motion.div
                  layoutId="balatro-nav"
                  className="absolute inset-0 rounded"
                  style={{ background: 'rgba(255,183,0,0.12)', border: '2px solid rgba(255,183,0,0.4)' }}
                />
              )}
              <Icon
                className="w-5 h-5 relative z-10 transition-colors"
                style={{ color: active ? '#ffb700' : 'rgba(255,245,214,0.3)', strokeWidth: active ? 2.5 : 2 }}
              />
              <span
                className="relative z-10 transition-colors"
                style={{
                  fontSize: 9,
                  fontFamily: 'Pixelify Sans, monospace',
                  color: active ? '#ffb700' : 'rgba(255,245,214,0.3)',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
