'use client';
import React from 'react';
import { motion } from 'motion/react';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className = '' }: BentoGridProps) {
  return (
    <div className={`grid grid-cols-2 gap-3.5 ${className}`}>
      {children}
    </div>
  );
}

interface BentoCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  gradient?: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function BentoCard({
  title,
  description,
  icon,
  badge,
  gradient = 'from-blue-500/10 via-indigo-500/5 to-transparent',
  className = '',
  onClick,
  children,
}: BentoCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/40 ${className}`}
    >
      {/* Subtle top gradient aura */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-70 transition-opacity group-hover:opacity-100`}
      />

      {/* Decorative radial spotlight inside card */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-all duration-500" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              {icon}
            </div>
          )}
          {badge && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-primary">
              {badge}
            </span>
          )}
        </div>

        <div>
          <h4 className="text-sm font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors">
            {title}
          </h4>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 font-medium">
              {description}
            </p>
          )}
        </div>

        {children}
      </div>
    </motion.div>
  );
}
