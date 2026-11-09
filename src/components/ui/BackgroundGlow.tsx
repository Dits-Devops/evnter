'use client';
import React from 'react';

interface BackgroundGlowProps {
  className?: string;
  variant?: 'spotlight' | 'mesh' | 'grid';
  children?: React.ReactNode;
}

export function BackgroundGlow({ className = '', variant = 'mesh', children }: BackgroundGlowProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Hardware-accelerated GPU gradients without costly CPU blur filters */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden transform-gpu">
        {variant === 'mesh' && (
          <>
            <div 
              className="absolute -top-[10%] -left-[10%] h-[320px] w-[320px] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.06) 45%, transparent 70%)',
              }}
            />
            <div 
              className="absolute top-[30%] -right-[15%] h-[280px] w-[280px] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, rgba(59,130,246,0.05) 50%, transparent 70%)',
              }}
            />
            <div 
              className="absolute -bottom-[10%] left-[20%] h-[240px] w-[240px] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)',
              }}
            />
          </>
        )}

        {variant === 'spotlight' && (
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[440px] h-[260px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.08) 45%, transparent 70%)',
            }}
          />
        )}

        {/* Lightweight dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }} 
        />
      </div>

      {children}
    </div>
  );
}

export function Spotlight({
  className = '',
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[520px] h-[340px] transform-gpu pointer-events-none ${className}`}
      style={{
        background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.22) 0%, rgba(147,197,253,0.08) 40%, transparent 70%)',
      }}
    />
  );
}
