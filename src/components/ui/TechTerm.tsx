import React, { useState } from 'react';

interface TechTermProps {
  term: string;
  definition: string;
}

export function TechTerm({ term, definition }: TechTermProps) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-block">
      <span
        className="cursor-help font-pixel"
        style={{ color: '#ffb700', textDecoration: 'underline dotted #ffb700', textUnderlineOffset: 3 }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {term}
      </span>
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded z-[100] text-center balatro-panel"
          style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.6)' }}>
          <span className="font-pixel text-[10px]" style={{ color: '#fff5d6' }}>{definition}</span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent"
            style={{ borderTopColor: '#7a4f2a' }} />
        </div>
      )}
    </span>
  );
}
