import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  required?: boolean;
  error?: string;
}

export default function Select({ label, name, value, onChange, options, required, error }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-bold text-foreground">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-3 rounded-2xl border bg-muted/40 text-foreground text-sm font-medium min-h-[48px] focus:outline-none transition-all ${
          error
            ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-card text-foreground">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-rose-500 text-xs mt-1 font-semibold">{error}</p>}
    </div>
  );
}
