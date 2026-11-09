import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({
  label,
  name,
  error,
  required,
  className,
  ...rest
}: InputProps) {
  void className; // intentionally overridden
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-bold text-foreground">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        {...rest}
        className={`w-full px-4 py-3 rounded-2xl border bg-muted/40 text-foreground text-sm font-medium transition-all min-h-[48px] focus:outline-none disabled:opacity-50 ${
          error
            ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
        }`}
      />
      {error && <p className="text-rose-500 text-xs mt-1 font-semibold">{error}</p>}
    </div>
  );
}
