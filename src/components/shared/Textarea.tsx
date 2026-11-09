import React from 'react';

interface TextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  error?: string;
}

export default function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  rows = 4,
  error,
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-bold text-foreground">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`w-full px-4 py-3 rounded-2xl border bg-muted/40 text-foreground text-sm font-medium transition-all resize-none focus:outline-none ${
          error
            ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
        }`}
      />
      {error && <p className="text-rose-500 text-xs mt-1 font-semibold">{error}</p>}
    </div>
  );
}
