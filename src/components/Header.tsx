'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center gap-3">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}
      <h1 className="text-lg font-black tracking-tight text-foreground flex-1">{title}</h1>
      {rightAction}
    </header>
  );
}
