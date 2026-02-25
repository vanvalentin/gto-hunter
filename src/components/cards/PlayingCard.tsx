import React from 'react';
import { motion } from 'motion/react';
import type { Suit, CardSkin } from '../../types';

interface PlayingCardProps {
  rank: string;
  suit: Suit;
  className?: string;
  skin?: CardSkin;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  faceDown?: boolean;
  selected?: boolean;
}

const SUIT_SYMBOLS: Record<Suit, string> = { s: '♠', h: '♥', c: '♣', d: '♦' };

interface FaceStyle {
  bg: string;
  redColor: string;
  blackColor: string;
  centerOpacity: number;
  overlay?: React.ReactNode;
}

const FACE_STYLES: Record<string, FaceStyle> = {
  classic: {
    bg: '#fffef8',
    redColor: '#cc2020',
    blackColor: '#1a1008',
    centerOpacity: 0.12,
  },
  shadow: {
    bg: '#0a0018',
    redColor: '#c084fc',
    blackColor: '#a855f7',
    centerOpacity: 0.28,
    overlay: (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.12) 0%, transparent 70%)' }} />
        <div className="absolute inset-2 rounded" style={{ border: '0.5px solid rgba(168,85,247,0.25)' }} />
      </div>
    ),
  },
  frost: {
    bg: '#e4f4f9',
    redColor: '#0891b2',
    blackColor: '#0e7490',
    centerOpacity: 0.14,
    overlay: (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(186,230,253,0.5) 0%, transparent 55%)' }} />
        <div className="absolute inset-2 rounded" style={{ border: '0.5px solid rgba(8,145,178,0.2)' }} />
      </div>
    ),
  },
  flames: {
    bg: '#fff6ed',
    redColor: '#dc2626',
    blackColor: '#c2410c',
    centerOpacity: 0.13,
    overlay: (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(251,146,60,0.12) 0%, transparent 50%)' }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(-60deg, transparent 0px, transparent 10px, rgba(249,115,22,0.05) 10px, rgba(249,115,22,0.05) 11px)',
        }} />
      </div>
    ),
  },
  neon: {
    bg: '#02000c',
    redColor: '#ec4899',
    blackColor: '#22d3ee',
    centerOpacity: 0.3,
    overlay: (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: [
            'linear-gradient(rgba(236,72,153,0.08) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(34,211,238,0.08) 1px, transparent 1px)',
          ].join(','),
          backgroundSize: '9px 9px',
        }} />
        <div className="absolute inset-2 rounded" style={{ border: '0.5px solid rgba(236,72,153,0.2)' }} />
      </div>
    ),
  },
  galaxy: {
    bg: '#04011a',
    redColor: '#a855f7',
    blackColor: '#38bdf8',
    centerOpacity: 0.32,
    overlay: (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 35%, rgba(139,92,246,0.15) 0%, transparent 60%)' }} />
        {([
          [22,18],[70,12],[48,55],[10,72],[85,68],[55,85],[35,42],[68,38],
        ] as [number,number][]).map(([x, y], i) => (
          <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`,
            width: i % 3 === 0 ? 2 : 1.5, height: i % 3 === 0 ? 2 : 1.5,
            background: 'white', borderRadius: '50%', opacity: i % 2 === 0 ? 0.75 : 0.45 }} />
        ))}
      </div>
    ),
  },
  royal: {
    bg: '#fdf6e3',
    redColor: '#9f1239',
    blackColor: '#78350f',
    centerOpacity: 0.1,
    overlay: (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-2 rounded" style={{ border: '1px solid rgba(180,130,0,0.3)' }} />
        <div className="absolute inset-3.5 rounded" style={{ border: '0.5px solid rgba(180,130,0,0.15)' }} />
      </div>
    ),
  },
  gold: {
    bg: '#fef3c7',
    redColor: '#b45309',
    blackColor: '#92400e',
    centerOpacity: 0.12,
    overlay: (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.18) 0%, transparent 50%)' }} />
        <div className="absolute inset-2 rounded" style={{ border: '1px solid rgba(180,130,0,0.25)' }} />
      </div>
    ),
  },
};

const SIZES: Record<string, { w: string; h: string; rankSize: string; suitSize: string; centerSize: string }> = {
  sm: { w: 'w-11', h: 'h-16', rankSize: 'text-sm', suitSize: 'text-xs', centerSize: 'text-2xl' },
  md: { w: 'w-16 md:w-[70px]', h: 'h-24 md:h-[100px]', rankSize: 'text-lg', suitSize: 'text-sm', centerSize: 'text-4xl' },
  lg: { w: 'w-24', h: 'h-36', rankSize: 'text-2xl', suitSize: 'text-lg', centerSize: 'text-6xl' },
};

const BACK_PATTERNS: Record<string, React.ReactNode> = {
  classic: (
    <div className="w-full h-full relative" style={{ background: '#c41e3a' }}>
      <div className="absolute inset-1.5 rounded" style={{ border: '2px solid rgba(255,255,255,0.3)' }} />
      <div className="absolute inset-2" style={{
        backgroundImage: [
          'repeating-linear-gradient(45deg,  rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 1.5px, transparent 1.5px, transparent 9px)',
          'repeating-linear-gradient(-45deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 1.5px, transparent 1.5px, transparent 9px)',
        ].join(','),
      }} />
      <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 28, color: 'rgba(255,255,255,0.18)' }}>♠</div>
    </div>
  ),
  shadow: (
    <div className="w-full h-full relative" style={{ background: 'linear-gradient(160deg, #130025 0%, #060010 100%)' }}>
      <div className="absolute inset-1.5 rounded" style={{ border: '1.5px solid rgba(168,85,247,0.55)' }} />
      <div className="absolute inset-0 flex items-center justify-center">
        {[30, 50, 70].map(r => (
          <div key={r} className="absolute rounded-full" style={{ width: `${r}%`, height: `${r}%`, border: '1px solid rgba(168,85,247,0.28)' }} />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 26, color: 'rgba(168,85,247,0.65)', textShadow: '0 0 10px rgba(168,85,247,0.8)' }}>✦</div>
    </div>
  ),
  frost: (
    <div className="w-full h-full relative" style={{ background: 'linear-gradient(160deg, #051830 0%, #020c1e 100%)' }}>
      <div className="absolute inset-1.5 rounded" style={{ border: '1.5px solid rgba(34,211,238,0.45)' }} />
      <div className="absolute inset-0" style={{
        backgroundImage: 'repeating-linear-gradient(60deg, rgba(34,211,238,0.09) 0px, rgba(34,211,238,0.09) 1px, transparent 1px, transparent 12px)',
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: 'repeating-linear-gradient(-60deg, rgba(34,211,238,0.09) 0px, rgba(34,211,238,0.09) 1px, transparent 1px, transparent 12px)',
      }} />
      <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 26, color: 'rgba(34,211,238,0.6)', textShadow: '0 0 8px rgba(34,211,238,0.7)' }}>❄</div>
    </div>
  ),
  flames: (
    <div className="w-full h-full relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #1a0400 0%, #0a0100 100%)' }}>
      <div className="absolute inset-1.5 rounded" style={{ border: '1.5px solid rgba(249,115,22,0.5)' }} />
      <div className="absolute inset-0" style={{
        backgroundImage: 'repeating-linear-gradient(-55deg, transparent 0px, transparent 7px, rgba(249,115,22,0.22) 7px, rgba(249,115,22,0.22) 9px)',
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: 'repeating-linear-gradient(-55deg, transparent 0px, transparent 18px, rgba(239,68,68,0.14) 18px, rgba(239,68,68,0.14) 20px)',
      }} />
      <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 24, filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.9))' }}>🔥</div>
    </div>
  ),
  neon: (
    <div className="w-full h-full relative" style={{ background: '#03000e' }}>
      <div className="absolute inset-1.5 rounded" style={{ border: '1.5px solid rgba(236,72,153,0.6)', boxShadow: 'inset 0 0 8px rgba(236,72,153,0.15)' }} />
      <div className="absolute inset-0" style={{
        backgroundImage: [
          'linear-gradient(rgba(236,72,153,0.18) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(236,72,153,0.18) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '11px 11px',
      }} />
      <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 24, color: 'rgba(236,72,153,0.85)', textShadow: '0 0 12px rgba(236,72,153,1)' }}>⚡</div>
    </div>
  ),
  galaxy: (
    <div className="w-full h-full relative" style={{ background: 'radial-gradient(ellipse at 35% 40%, #1a0a2e 0%, #020108 65%)' }}>
      <div className="absolute inset-1.5 rounded" style={{ border: '1px solid rgba(139,92,246,0.4)' }} />
      {([
        [18,14],[72,22],[44,52],[12,68],[82,72],[56,82],[30,38],[64,48],[50,18],[25,85],[78,45],
      ] as [number,number][]).map(([x, y], i) => (
        <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`,
          width: i % 3 === 0 ? 2.5 : 1.5, height: i % 3 === 0 ? 2.5 : 1.5,
          background: 'white', borderRadius: '50%', opacity: i % 3 === 0 ? 0.9 : 0.55 }} />
      ))}
      <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 22, color: 'rgba(139,92,246,0.7)', textShadow: '0 0 10px rgba(139,92,246,0.9)' }}>★</div>
    </div>
  ),
  royal: (
    <div className="w-full h-full relative" style={{ background: 'linear-gradient(160deg, #110900 0%, #060400 100%)' }}>
      <div className="absolute inset-1.5 rounded" style={{ border: '2px solid rgba(251,191,36,0.55)' }} />
      <div className="absolute inset-3 rounded" style={{ border: '1px solid rgba(251,191,36,0.25)' }} />
      <div className="absolute inset-0" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent 0px, transparent 14px, rgba(251,191,36,0.05) 14px, rgba(251,191,36,0.05) 15px)',
      }} />
      <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 28, color: 'rgba(251,191,36,0.7)', textShadow: '0 0 10px rgba(251,191,36,0.5)' }}>♛</div>
    </div>
  ),
  gold: (
    <div className="w-full h-full relative" style={{ background: 'linear-gradient(160deg, #3a2500 0%, #1a1000 100%)' }}>
      <div className="absolute inset-1.5 rounded" style={{ border: '2.5px solid rgba(251,191,36,0.6)' }} />
      <div className="absolute inset-3 rounded" style={{ border: '1px solid rgba(251,191,36,0.3)' }} />
      <div className="absolute inset-0" style={{
        backgroundImage: [
          'repeating-linear-gradient(45deg,  rgba(251,191,36,0.08) 0px, rgba(251,191,36,0.08) 1px, transparent 1px, transparent 10px)',
          'repeating-linear-gradient(-45deg, rgba(251,191,36,0.08) 0px, rgba(251,191,36,0.08) 1px, transparent 1px, transparent 10px)',
        ].join(','),
      }} />
      <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 24, color: 'rgba(251,191,36,0.65)', textShadow: '0 0 8px rgba(251,191,36,0.6)' }}>✦</div>
    </div>
  ),
};

export function PlayingCard({
  rank, suit, className = '', skin, size = 'md', animate = false, faceDown = false, selected = false,
}: PlayingCardProps) {
  const sz = SIZES[size];
  const suitSymbol = SUIT_SYMBOLS[suit];

  const faceStyle = FACE_STYLES[skin?.pattern ?? 'classic'] ?? FACE_STYLES.classic;
  const isRed = suit === 'h' || suit === 'd';
  const suitColor = isRed ? faceStyle.redColor : faceStyle.blackColor;

  const borderColor = skin?.borderColor ?? '#2a1a0a';

  const cardStyle: React.CSSProperties = {
    border: `3px solid ${selected ? '#ffb700' : borderColor}`,
    boxShadow: selected
      ? `4px 4px 0 #b88a00, 0 0 16px rgba(255,183,0,0.5)`
      : `4px 4px 0 rgba(0,0,0,0.6)`,
  };

  const faceContent = (
    <div className="w-full h-full relative overflow-hidden" style={{ background: faceStyle.bg }}>
      {faceStyle.overlay}
      {/* Top-left rank+suit */}
      <div className="absolute top-1 left-1.5 flex flex-col items-center leading-none" style={{ color: suitColor }}>
        <span className={`${sz.rankSize} font-black leading-none`} style={{ fontFamily: 'Nunito, sans-serif' }}>{rank}</span>
        <span className={`${sz.suitSize} leading-none`}>{suitSymbol}</span>
      </div>
      {/* Center suit watermark */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ color: suitColor }}>
        <span className={sz.centerSize} style={{ opacity: faceStyle.centerOpacity }}>{suitSymbol}</span>
      </div>
      {/* Bottom-right rank+suit (rotated) */}
      <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180" style={{ color: suitColor }}>
        <span className={`${sz.rankSize} font-black leading-none`} style={{ fontFamily: 'Nunito, sans-serif' }}>{rank}</span>
        <span className={`${sz.suitSize} leading-none`}>{suitSymbol}</span>
      </div>
    </div>
  );

  const backPattern = BACK_PATTERNS[skin?.pattern ?? 'classic'];
  const backContent = (
    <div className="w-full h-full relative overflow-hidden rounded-[4px]">
      {backPattern}
    </div>
  );

  const inner = (
    <div
      className={`${sz.w} ${sz.h} rounded-lg overflow-hidden relative playing-card ${className}`}
      style={cardStyle}
    >
      {faceDown ? backContent : faceContent}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20, rotateY: 90 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {inner}
      </motion.div>
    );
  }

  return inner;
}
