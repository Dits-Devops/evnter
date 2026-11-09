'use client';
import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderBeam?: boolean;
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className = '',
  glowColor = 'rgba(59, 130, 246, 0.15)',
  borderBeam = false,
  onClick,
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-3xl border border-border/80 bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/40 ${className}`}
    >
      {/* Dynamic Cursor Spotlight Tracking (Aceternity UI effect) */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 60%)`,
        }}
      />

      {/* Border Beam Animation (Magic UI effect) */}
      {borderBeam && (
        <div className="pointer-events-none absolute inset-0 rounded-3xl">
          <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,rgba(59,130,246,0.5)_50%,transparent_100%)] opacity-30" />
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
