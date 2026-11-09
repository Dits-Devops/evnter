'use client';
import React from 'react';
import { motion } from 'motion/react';

interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface SegmentedTabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SegmentedTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'md',
}: SegmentedTabsProps<T>) {
  const sizeClasses = {
    sm: 'p-1 text-xs gap-1',
    md: 'p-1.5 text-xs font-semibold gap-1.5',
    lg: 'p-2 text-sm font-bold gap-2',
  }[size];

  return (
    <div
      role="tablist"
      className={`relative flex items-center rounded-2xl bg-muted/60 p-1 backdrop-blur-md border border-border/40 shadow-inner ${sizeClasses} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            type="button"
            className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-center transition-colors duration-200 outline-none select-none active:scale-95 ${
              isActive
                ? 'text-foreground font-bold shadow-sm'
                : 'text-muted-foreground hover:text-foreground font-medium'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 rounded-xl bg-card border border-border/60 shadow-sm"
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 32,
                }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
