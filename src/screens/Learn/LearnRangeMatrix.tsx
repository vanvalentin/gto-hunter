import React, { useState } from 'react';
import { TechTerm } from '../../components/ui/TechTerm';
import type { HandData, HandStrategy } from '../../types';

interface Props { onBack: () => void; }

const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];

function getHandData(hand: string): HandData {
  if (hand === 'AKs') return { strategy: { raise: 80, call: 20, fold: 0 }, ev: 3.4 };
  if (['AA','KK','QQ','JJ','AKo','AQs'].includes(hand)) return { strategy: { raise: 100, call: 0, fold: 0 }, ev: 4.5 };
  if (['TT','99','AQo','AJs','KQs'].includes(hand)) return { strategy: { raise: 50, call: 50, fold: 0 }, ev: 1.2 };
  if (['88','77','AJo','ATs','KJs','QTs','JTs'].includes(hand)) return { strategy: { raise: 0, call: 100, fold: 0 }, ev: 0.5 };
  if (['66','55','ATo','A9s','A8s','KTo','QJo','JTo','T9s','98s'].includes(hand)) return { strategy: { raise: 0, call: 50, fold: 50 }, ev: 0.1 };
  return { strategy: { raise: 0, call: 0, fold: 100 }, ev: -0.5 };
}

function getCellBg(s: HandStrategy): string {
  const { raise, call, fold } = s;
  if (raise === 100) return '#1a4d8a';
  if (call  === 100) return '#8a6000';
  if (fold  === 100) return '#1a3a27';
  const stops: string[] = [];
  let c = 0;
  if (raise > 0) { stops.push(`#1a4d8a ${c}%`, `#1a4d8a ${c+raise}%`); c += raise; }
  if (call  > 0) { stops.push(`#8a6000 ${c}%`, `#8a6000 ${c+call}%`);  c += call;  }
  if (fold  > 0) { stops.push(`#1a3a27 ${c}%`, `#1a3a27 ${c+fold}%`);  c += fold;  }
  return `linear-gradient(135deg, ${stops.join(',')})`;
}

export function LearnRangeMatrix({ onBack }: Props) {
  const [viewMode, setViewMode] = useState<'freq' | 'ev'>('freq');
  const [selected, setSelected] = useState('AKs');
  const data = getHandData(selected);

  return (
    <div className="flex-1 flex flex-col overflow-hidden felt-bg">
      {/* Toggle */}
      <div className="flex justify-center gap-2 py-2 px-4" style={{ background: '#0f2219', borderBottom: '2px solid rgba(0,0,0,0.4)' }}>
        {(['freq','ev'] as const).map(m => (
          <button key={m}
            onClick={() => setViewMode(m)}
            className={`btn-balatro px-4 py-1.5 text-xs ${viewMode === m ? 'btn-blue' : 'btn-dark'}`}>
            {m === 'freq' ? 'Frequency' : 'EV'}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3 pb-52">
        <div className="w-full max-w-xl mx-auto aspect-square grid rounded-lg overflow-hidden"
          style={{ gridTemplateColumns: 'repeat(13, minmax(0,1fr))', gap: 1, background: '#0f2219', border: '3px solid rgba(0,0,0,0.5)', boxShadow: '4px 4px 0 rgba(0,0,0,0.5)' }}>
          {RANKS.map((rr, ri) => RANKS.map((cr, ci) => {
            let hand = ri < ci ? `${rr}${cr}s` : ri > ci ? `${cr}${rr}o` : `${rr}${cr}`;
            const { strategy, ev } = getHandData(hand);
            const isSel = selected === hand;
            return (
              <button key={hand} onClick={() => setSelected(hand)}
                className="relative flex items-center justify-center cursor-pointer hover:z-10 hover:scale-110 transition-transform"
                style={{ background: getCellBg(strategy), outline: isSel ? '2px solid #ffb700' : 'none', outlineOffset: -1, zIndex: isSel ? 10 : 1 }}>
                <span className="font-pixel text-[6px] md:text-[7px] leading-none text-white/70">
                  {viewMode === 'freq' ? hand : (ev > 0 ? `+${ev}` : ev)}
                </span>
              </button>
            );
          }))}
        </div>
      </div>

      {/* Inspector */}
      <div className="absolute bottom-0 left-0 w-full p-3 pb-5"
        style={{ background: '#0f2219', borderTop: '3px solid rgba(0,0,0,0.5)' }}>
        <div className="max-w-xl mx-auto">
          {/* Legend */}
          <div className="flex justify-center gap-5 mb-3">
            {[{bg:'#1a4d8a',label:'Raise'},{bg:'#8a6000',label:'Call'},{bg:'#1a3a27',label:'Fold'}].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: l.bg, border: '2px solid rgba(255,255,255,0.15)' }} />
                <span className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.5)' }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Selected hand */}
          <div className="balatro-panel p-3 flex items-center gap-4">
            <div className="balatro-panel px-3 py-2 shrink-0" style={{ border: '2px solid #ffb700', boxShadow: '3px 3px 0 #b88a00' }}>
              <span className="font-pixel text-lg" style={{ color: '#ffb700' }}>{selected}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-pixel text-[10px]" style={{ color: 'rgba(255,245,214,0.5)' }}>EV</span>
                <span className="font-pixel text-base" style={{ color: data.ev >= 0 ? '#4a90e2' : '#e63946' }}>
                  {data.ev > 0 ? '+' : ''}{data.ev} <TechTerm term="BB" definition="Big Blind" />
                </span>
              </div>
              <div className="flex rounded overflow-hidden" style={{ height: 8, background: '#1a3a27', border: '2px solid rgba(0,0,0,0.4)' }}>
                {data.strategy.raise > 0 && <div style={{ width:`${data.strategy.raise}%`, background:'#2563eb' }} />}
                {data.strategy.call  > 0 && <div style={{ width:`${data.strategy.call}%`,  background:'#ffb700' }} />}
                {data.strategy.fold  > 0 && <div style={{ width:`${data.strategy.fold}%`,  background:'#1a3a27' }} />}
              </div>
              <div className="flex gap-2 mt-1">
                {data.strategy.raise > 0 && <span className="font-pixel text-[9px]" style={{ color: '#4a90e2' }}>R {data.strategy.raise}%</span>}
                {data.strategy.call  > 0 && <span className="font-pixel text-[9px]" style={{ color: '#ffb700' }}>C {data.strategy.call}%</span>}
                {data.strategy.fold  > 0 && <span className="font-pixel text-[9px]" style={{ color: 'rgba(255,245,214,0.4)' }}>F {data.strategy.fold}%</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
