import React from 'react';
import { motion } from 'motion/react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  children: React.ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-[#7C3AED] text-white border-2 border-[#9d5ff0] hover:bg-[#6D28D9] shadow-[0_0_20px_rgba(124,58,237,0.4)]',
  secondary:
    'bg-[#1a1a2e] text-[#E2D9F3] border-2 border-[#2d2d4e] hover:border-[#7C3AED] hover:bg-[#1f1f3a]',
  danger:
    'bg-[#991B1B] text-white border-2 border-[#EF4444] hover:bg-[#7F1D1D] shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  ghost:
    'bg-transparent text-[#E2D9F3] border-2 border-[#2d2d4e] hover:border-[#C9A84C] hover:text-[#C9A84C]',
  gold:
    'bg-[#C9A84C] text-[#0A0A12] border-2 border-[#FBBF24] hover:bg-[#D4AF50] shadow-[0_0_24px_rgba(201,168,76,0.5)] font-black',
};

const SIZES: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-4 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  glow = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`
        rounded-xl font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${glow ? 'animate-pulse-glow' : ''}
        ${className}
      `}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
