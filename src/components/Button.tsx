import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  fullWidth = false,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:scale-100';

  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm rounded-xl',
    md: 'h-12 px-6 text-base rounded-2xl',
    lg: 'h-14 px-8 text-lg rounded-2xl',
    icon: 'h-10 w-10 rounded-xl',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {children && <span>Memuat...</span>}
        </>
      ) : (
        children
      )}
    </button>
  );
}
