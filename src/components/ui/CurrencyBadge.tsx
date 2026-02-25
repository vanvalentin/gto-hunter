import React from 'react';

interface CurrencyBadgeProps {
  amount: number;
  type: 'gold' | 'gems';
  size?: 'sm' | 'md';
}

export function CurrencyBadge({ amount, type, size = 'md' }: CurrencyBadgeProps) {
  const isGold = type === 'gold';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <div className={`${isGold ? 'chip-box' : 'mult-box'} px-3 py-1.5 flex items-center gap-1.5 ${textSize}`}>
      <span>{isGold ? '🪙' : '💎'}</span>
      <span>{amount.toLocaleString()}</span>
    </div>
  );
}
