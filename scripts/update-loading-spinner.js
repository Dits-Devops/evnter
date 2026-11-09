const fs = require('fs');
const path = require('path');

const content = `'use client';

import React from 'react';
import { Sparkles, Ticket } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'screen';
  label?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  label 
}: LoadingSpinnerProps) {
  const isScreen = size === 'screen';

  const dims = {
    sm: { container: 'w-8 h-8', ring: 'w-8 h-8 border-2', icon: 'w-3.5 h-3.5' },
    md: { container: 'w-14 h-14', ring: 'w-14 h-14 border-[3px]', icon: 'w-6 h-6' },
    lg: { container: 'w-20 h-20', ring: 'w-20 h-20 border-4', icon: 'w-8 h-8' },
    screen: { container: 'w-24 h-24', ring: 'w-24 h-24 border-4', icon: 'w-10 h-10' },
  }[size];

  const contentNode = (
    <div className="flex flex-col items-center justify-center gap-3.5 select-none">
      {/* Animated Glowing Icon Orb */}
      <div className={\`relative \${dims.container} flex items-center justify-center\`}>
        {/* Outer Glow Halo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-400 opacity-25 blur-xl animate-pulse" />

        {/* Dual Spinning Gradient Rings */}
        <div 
          className={\`absolute inset-0 rounded-full \${dims.ring} border-transparent border-t-primary border-r-indigo-500 animate-spin\`}
          style={{ animationDuration: '0.85s' }}
        />
        <div 
          className={\`absolute inset-1 rounded-full \${dims.ring} border-transparent border-b-cyan-400 border-l-blue-400 opacity-70 animate-spin\`}
          style={{ animationDuration: '1.4s', animationDirection: 'reverse' }}
        />

        {/* Center Glass Capsule with Animated Ticket Icon */}
        <div className="relative z-10 w-[72%] h-[72%] rounded-full bg-card/90 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-inner flex items-center justify-center text-primary">
          <Ticket className={\`\${dims.icon} text-primary animate-pulse\`} />
        </div>

        {/* Orbiting Sparkle Star */}
        <div 
          className="absolute -top-1 right-0 text-amber-400 animate-bounce"
          style={{ animationDuration: '1.8s' }}
        >
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Optional Pulsing Text Label */}
      {label && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground tracking-wide">
          <span>{label}</span>
          <span className="inline-flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-primary animate-ping" />
            <span className="w-1 h-1 rounded-full bg-primary animate-ping" style={{ animationDelay: '0.2s' }} />
            <span className="w-1 h-1 rounded-full bg-primary animate-ping" style={{ animationDelay: '0.4s' }} />
          </span>
        </div>
      )}
    </div>
  );

  if (isScreen) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background/80 backdrop-blur-md">
        {contentNode}
      </div>
    );
  }

  return <div className="p-4 flex items-center justify-center">{contentNode}</div>;
}
`;

const target = path.join(__dirname, '../src/components/LoadingSpinner.tsx');
fs.writeFileSync(target, content, 'utf8');
console.log('Updated LoadingSpinner.tsx successfully');
