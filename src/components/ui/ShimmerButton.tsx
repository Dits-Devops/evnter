'use client';
import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface ShimmerButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
}

export function ShimmerButton({
  children,
  shimmerColor = '#ffffff',
  shimmerSize = '0.08em',
  borderRadius = '16px',
  shimmerDuration = '2.5s',
  background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #4338ca 100%)',
  className = '',
  disabled,
  ...props
}: ShimmerButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02, transition: { duration: 0.15 } }}
      whileTap={disabled ? undefined : { scale: 0.97, transition: { duration: 0.1 } }}
      disabled={disabled}
      style={
        {
          '--spread': '90deg',
          '--shimmer-color': shimmerColor,
          '--radius': borderRadius,
          '--speed': shimmerDuration,
          '--cut': shimmerSize,
          '--bg': background,
        } as React.CSSProperties
      }
      className={`group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3.5 font-bold text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] [border-radius:var(--radius)] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {/* Container spark */}
      <div className="absolute inset-0 -z-30 overflow-visible [container-type:size]">
        <div className="absolute inset-0 h-[100cqh] animate-slide-shimmer [aspect-ratio:1] [border-radius:0] [mask:none]">
          <div className="animate-spin-around absolute inset-[-100%] w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
        </div>
      </div>

      {/* Shimmer backdrop */}
      <div className="absolute inset-[1px] -z-20 rounded-[calc(var(--radius)-1px)] [background:var(--bg)] transition-colors group-hover:brightness-110" />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2 text-sm font-bold tracking-tight">
        {children}
      </span>
    </motion.button>
  );
}
