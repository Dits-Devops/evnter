import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: boolean;
}

export default function Card({ children, className = '', onClick, padding = true }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-card text-card-foreground rounded-[1.5rem] shadow-soft border border-border/50 ${padding ? 'p-5' : ''} ${
        onClick ? 'cursor-pointer hover:shadow-lg transition-all active:scale-[0.99]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
