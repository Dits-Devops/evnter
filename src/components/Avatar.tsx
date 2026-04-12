'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getInitials } from '@/utils/helpers';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackClassName?: string;
}

export default function Avatar({
  src,
  name = 'User',
  size = 'md',
  className = '',
  fallbackClassName = '',
}: AvatarProps) {
  const [error, setError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const roundedClasses = {
    sm: 'rounded-full',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
  };

  const initials = getInitials(name);

  if (!src || error) {
    return (
      <div 
        className={`
          flex items-center justify-center font-black text-white shrink-0
          bg-gradient-to-br from-blue-400 to-indigo-600
          ${sizeClasses[size]} 
          ${roundedClasses[size]} 
          ${fallbackClassName}
          ${className}
        `}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 overflow-hidden ${sizeClasses[size]} ${roundedClasses[size]} ${className}`}>
      <Image
        src={src}
        alt={name}
        fill
        className="object-cover"
        onError={() => setError(true)}
        unoptimized={src.startsWith('blob:')} // Handle local previews
      />
    </div>
  );
}
