import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import type { ChipSkin } from '../../types';

/** Approximate luminance check */
function isLight(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length !== 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160;
}

/* ── Circular casino chip SVG ────────────────────────────────────────────── */

export function PokerChip({ skin, size = 72 }: { skin: ChipSkin; size?: number }) {
  const c = size / 2;
  const outerR = c - 2;
  const edgeInnerR = outerR * 0.76; // inner edge of the rim band
  const discR = outerR * 0.62;      // main centre disc

  // 4 evenly-spaced accent stripe pairs around the edge
  const NUM_STRIPES = 4;
  const HALF_ARC = 0.30; // radians per stripe half (~17°)

  const stripeSegments = Array.from({ length: NUM_STRIPES }, (_, i) => {
    const mid = (i / NUM_STRIPES) * 2 * Math.PI - Math.PI / 2;
    const s = mid - HALF_ARC;
    const e = mid + HALF_ARC;

    const x1o = c + outerR    * Math.cos(s); const y1o = c + outerR    * Math.sin(s);
    const x2o = c + outerR    * Math.cos(e); const y2o = c + outerR    * Math.sin(e);
    const x1i = c + edgeInnerR * Math.cos(e); const y1i = c + edgeInnerR * Math.sin(e);
    const x2i = c + edgeInnerR * Math.cos(s); const y2i = c + edgeInnerR * Math.sin(s);

    return `M ${x1o} ${y1o} A ${outerR} ${outerR} 0 0 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${edgeInnerR} ${edgeInnerR} 0 0 0 ${x2i} ${y2i} Z`;
  });

  const textColor = isLight(skin.chipBg) ? '#1a0f08' : 'rgba(255,255,255,0.85)';

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ filter: `drop-shadow(2px 3px 1px ${skin.chipShadow})`, overflow: 'visible' }}
    >
      {/* Base chip fill */}
      <circle cx={c} cy={c} r={outerR} fill={skin.chipBg} />

      {/* Accent stripe segments */}
      {stripeSegments.map((d, i) => (
        <path key={i} d={d} fill={skin.multBg} />
      ))}

      {/* Outer rim ring */}
      <circle cx={c} cy={c} r={outerR}    fill="none" stroke={skin.chipBorder} strokeWidth="2.5" />
      {/* Edge-inner boundary */}
      <circle cx={c} cy={c} r={edgeInnerR} fill="none" stroke={skin.chipBorder} strokeWidth="1"   opacity="0.6" />

      {/* Centre disc */}
      <circle cx={c} cy={c} r={discR} fill={skin.chipBg} />
      <circle cx={c} cy={c} r={discR} fill="none" stroke={skin.chipBorder} strokeWidth="1.8" />

      {/* Inner decorative ring */}
      <circle cx={c} cy={c} r={discR * 0.72} fill="none" stroke={skin.chipBorder} strokeWidth="0.8" opacity="0.45" />

      {/* Centre icon */}
      <text
        x={c} y={c + discR * 0.36}
        textAnchor="middle"
        fontSize={discR * 0.72}
        fill={textColor}
        style={{ fontFamily: 'Pixelify Sans, monospace', fontWeight: 700 }}
      >
        {skin.icon}
      </text>

      {/* Highlight */}
      <ellipse
        cx={c - c * 0.14} cy={c - c * 0.26}
        rx={c * 0.28} ry={c * 0.15}
        fill="rgba(255,255,255,0.18)"
      />
    </svg>
  );
}

/* ── Chips × Mult score display ─────────────────────────────────────────── */

interface ChipDisplayProps {
  chips: number;
  mult: number;
  size?: 'sm' | 'md' | 'lg';
  skin?: ChipSkin;
}

export function ChipDisplay({ chips, mult, size = 'md', skin: skinProp }: ChipDisplayProps) {
  const { equippedChipSkin } = usePlayerStore();
  const skin = skinProp ?? equippedChipSkin;

  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-3xl' : 'text-lg';
  const px = size === 'sm' ? 'px-2 py-1' : size === 'lg' ? 'px-5 py-3' : 'px-3 py-1.5';

  const chipStyle: React.CSSProperties = {
    background: skin.chipBg,
    border: `3px solid ${skin.chipBorder}`,
    borderRadius: 6,
    color: isLight(skin.chipBg) ? '#1a0f08' : 'white',
    fontFamily: "'Pixelify Sans', monospace",
    fontWeight: 700,
    boxShadow: `3px 3px 0 ${skin.chipShadow}, inset 0 1px 0 rgba(255,255,255,0.18)`,
  };

  const multStyle: React.CSSProperties = {
    background: skin.multBg,
    border: `3px solid ${skin.multBorder}`,
    borderRadius: 6,
    color: isLight(skin.multBg) ? '#1a0f08' : 'white',
    fontFamily: "'Pixelify Sans', monospace",
    fontWeight: 700,
    boxShadow: `3px 3px 0 ${skin.multShadow}, inset 0 1px 0 rgba(255,255,255,0.18)`,
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`${px} ${textSize} min-w-[48px] text-center`} style={chipStyle}>{chips}</div>
      <span className={`font-pixel ${textSize}`} style={{ color: '#fff5d6' }}>×</span>
      <div className={`${px} ${textSize} min-w-[40px] text-center`} style={multStyle}>{mult}</div>
    </div>
  );
}

/* ── Shop detail preview ─────────────────────────────────────────────────── */

export function ChipSkinPreview({ skin }: { skin: ChipSkin }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <PokerChip skin={skin} size={100} />
      <div className="flex flex-col items-center gap-2">
        <p className="font-pixel text-[10px]" style={{ color: 'rgba(255,245,214,0.5)' }}>Score display preview</p>
        <ChipDisplay chips={215} mult={8} size="lg" skin={skin} />
        <div className="flex gap-2 mt-1">
          <ChipDisplay chips={88} mult={3} size="sm" skin={skin} />
          <ChipDisplay chips={42} mult={5} size="sm" skin={skin} />
        </div>
      </div>
    </div>
  );
}
