import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, Target, TrendingUp, Star, Flame, Shield, Award, ChevronRight, Layers } from 'lucide-react';
import { TopBar } from '../../components/ui/TopBar';
import { PlayingCard } from '../../components/cards/PlayingCard';
import { usePlayerStore, AVAILABLE_SKINS } from '../../store/playerStore';

interface StatRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}

function StatRow({ icon: Icon, label, value, color }: StatRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5"
      style={{ borderBottom: '2px solid rgba(0,0,0,0.4)' }}>
      <div className="w-8 h-8 flex items-center justify-center shrink-0"
        style={{ background: '#1f1208', border: `2px solid ${color}60`, borderRadius: 6, boxShadow: '2px 2px 0 #3a2010' }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <span className="font-pixel text-xs flex-1" style={{ color: 'rgba(255,245,214,0.5)' }}>{label}</span>
      <span className="font-pixel text-sm" style={{ color: '#fff5d6' }}>{value}</span>
    </div>
  );
}

export function ProfileScreen() {
  const { player, equippedSkin, skins, deckCustomization, ownedCardItems } = usePlayerStore();
  const navigate = useNavigate();
  const ownedSkins = skins.filter((s) => s.owned);
  const customizedCount = Object.keys(deckCustomization).length;
  const uniqueCardItems = new Set(ownedCardItems.map((i) => i.cardKey)).size;
  const winRate = player.wins + player.losses > 0
    ? Math.round((player.wins / (player.wins + player.losses)) * 100)
    : 0;
  const xpPct = Math.round((player.xp / player.xpToNext) * 100);

  const rank = player.elo >= 2000 ? 'Grand Master'
    : player.elo >= 1700 ? 'Diamond'
    : player.elo >= 1400 ? 'Platinum'
    : player.elo >= 1100 ? 'Gold'
    : 'Silver';

  const rankIcon = player.elo >= 2000 ? '👑'
    : player.elo >= 1700 ? '💎'
    : player.elo >= 1400 ? '🏆'
    : player.elo >= 1100 ? '🥇'
    : '🥈';

  const ACHIEVEMENTS = [
    { icon: '🎯', name: 'First Blood',  unlocked: true },
    { icon: '🔥', name: 'On Fire',      unlocked: player.streak >= 3 },
    { icon: '💎', name: 'Collector',    unlocked: ownedSkins.length >= 2 },
    { icon: '🏆', name: 'Champion',     unlocked: player.wins >= 10 },
    { icon: '🧠', name: 'GTO Master',   unlocked: false },
    { icon: '⚡', name: 'Speed King',   unlocked: false },
    { icon: '👑', name: 'Grand Master', unlocked: player.elo >= 2000 },
    { icon: '🌟', name: 'Legend',       unlocked: false },
  ];

  return (
    <div className="min-h-screen flex flex-col felt-dark-bg">
      <TopBar title="Profile" showCurrency />

      <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4">

        {/* Avatar & player info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 mb-5"
        >
          <div className="relative">
            <img
              src={player.avatar}
              alt={player.username}
              className="w-24 h-24 object-cover"
              style={{
                border: '3px solid #ffb700',
                boxShadow: '4px 4px 0 #b88a00',
                borderRadius: 8,
              }}
            />
            <div
              className="absolute -bottom-2 -right-2 w-7 h-7 flex items-center justify-center font-pixel text-sm"
              style={{ background: '#cc2936', border: '2px solid #8a1920', boxShadow: '2px 2px 0 #8a1920', borderRadius: 6, color: 'white' }}
            >
              {player.level}
            </div>
          </div>

          <div className="text-center">
            <h2 className="font-pixel text-2xl" style={{ color: '#fff5d6', textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}>
              {player.username}
            </h2>
            <div className="flex items-center gap-2 justify-center mt-2">
              <span className="font-pixel text-xs px-2 py-1"
                style={{ background: '#1a0f00', border: '2px solid #b88a00', boxShadow: '2px 2px 0 #8a6000', borderRadius: 6, color: '#ffb700' }}>
                {rankIcon} {rank}
              </span>
              {player.streak > 0 && (
                <span className="font-pixel text-xs px-2 py-1 flex items-center gap-1"
                  style={{ background: '#2a1500', border: '2px solid #a04018', boxShadow: '2px 2px 0 #6a2800', borderRadius: 6, color: '#e8622a' }}>
                  <Flame className="w-3 h-3" />
                  {player.streak} streak
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Equipped skin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="balatro-panel flex items-center gap-4 p-3 mb-4"
        >
          <PlayingCard rank="A" suit="s" skin={equippedSkin} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-pixel text-[9px] uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,245,214,0.4)' }}>
              Equipped Skin
            </p>
            <p className="font-pixel text-sm" style={{ color: '#fff5d6' }}>{equippedSkin.name}</p>
            <p className="font-pixel text-[10px] capitalize" style={{ color: equippedSkin.glowColor }}>{equippedSkin.rarity}</p>
          </div>
          <span className="font-pixel text-[10px] shrink-0" style={{ color: 'rgba(255,245,214,0.35)' }}>
            {ownedSkins.length}/{AVAILABLE_SKINS.length} skins
          </span>
        </motion.div>

        {/* My Deck */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.11 }}
          className="mb-4"
        >
          <button
            onClick={() => navigate('/profile/deck')}
            className="w-full balatro-panel p-3 flex items-center gap-3 cursor-pointer"
            style={{ border: '2px solid rgba(74,144,226,0.35)', boxShadow: '4px 4px 0 rgba(0,0,0,0.4)' }}
          >
            <div className="w-9 h-9 flex items-center justify-center shrink-0"
              style={{ background: '#0f1e30', border: '2px solid #4a90e260', borderRadius: 8, boxShadow: '2px 2px 0 #0a1520' }}>
              <Layers className="w-4 h-4" style={{ color: '#4a90e2' }} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-pixel text-xs" style={{ color: '#fff5d6' }}>My Deck</p>
              <p className="font-pixel text-[9px] mt-0.5" style={{ color: 'rgba(255,245,214,0.4)' }}>
                {uniqueCardItems} cards collected · {customizedCount} customized
              </p>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,245,214,0.3)' }} />
          </button>
        </motion.div>

        {/* XP bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
          className="balatro-panel p-3 mb-4"
        >
          <div className="flex justify-between mb-2">
            <span className="font-pixel text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,245,214,0.4)' }}>
              Level {player.level}
            </span>
            <span className="font-pixel text-[10px]" style={{ color: '#4a90e2' }}>
              {player.xp.toLocaleString()} / {player.xpToNext.toLocaleString()} XP
            </span>
          </div>
          <div className="w-full h-3 overflow-hidden mb-1.5"
            style={{ background: '#0f2219', border: '2px solid #1d3a27', borderRadius: 4 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-full"
              style={{ background: 'linear-gradient(90deg, #2563eb, #4a90e2)' }}
            />
          </div>
          <p className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.35)' }}>
            {(player.xpToNext - player.xp).toLocaleString()} XP to Level {player.level + 1}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="balatro-panel p-3 mb-4"
        >
          <p className="font-pixel text-[9px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,245,214,0.4)' }}>
            Statistics
          </p>
          <StatRow icon={Trophy}     label="ELO Rating"      value={`${player.elo}`}                        color="#ffb700" />
          <StatRow icon={Target}     label="Win Rate"         value={`${winRate}%`}                          color="#3a8a4a" />
          <StatRow icon={TrendingUp} label="Wins / Losses"    value={`${player.wins} / ${player.losses}`}    color="#4a90e2" />
          <StatRow icon={Flame}      label="Best Streak"      value={`${player.streak}`}                     color="#e8622a" />
          <StatRow icon={Star}       label="Gold Earned"      value={player.gold.toLocaleString()}            color="#ffb700" />
          <StatRow icon={Shield}     label="Gems Owned"       value={player.gems.toLocaleString()}            color="#e63946" />
          <div className="flex items-center gap-3 pt-2.5">
            <div className="w-8 h-8 flex items-center justify-center shrink-0"
              style={{ background: '#1f1208', border: '2px solid #e8622a60', borderRadius: 6, boxShadow: '2px 2px 0 #3a2010' }}>
              <Award className="w-4 h-4" style={{ color: '#e8622a' }} />
            </div>
            <span className="font-pixel text-xs flex-1" style={{ color: 'rgba(255,245,214,0.5)' }}>Skins Collected</span>
            <span className="font-pixel text-sm" style={{ color: '#fff5d6' }}>{ownedSkins.length}/{AVAILABLE_SKINS.length}</span>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.23 }}
          className="balatro-panel p-3"
        >
          <p className="font-pixel text-[9px] uppercase tracking-widest mb-3" style={{ color: 'rgba(255,245,214,0.4)' }}>
            Achievements
          </p>
          <div className="grid grid-cols-4 gap-2">
            {ACHIEVEMENTS.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="flex flex-col items-center gap-1.5 p-2"
                style={{
                  background: a.unlocked ? '#1a0f00' : '#1f1208',
                  border: `2px solid ${a.unlocked ? '#b88a00' : '#7a4f2a'}`,
                  boxShadow: a.unlocked ? '3px 3px 0 #8a6000' : '2px 2px 0 #3a2010',
                  borderRadius: 6,
                  opacity: a.unlocked ? 1 : 0.45,
                }}
              >
                <span className="text-xl leading-none">{a.icon}</span>
                <span className="font-pixel text-[8px] text-center leading-tight"
                  style={{ color: a.unlocked ? '#ffb700' : 'rgba(255,245,214,0.4)' }}>
                  {a.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
