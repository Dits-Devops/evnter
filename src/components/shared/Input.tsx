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
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        {...rest}
        className={`w-full px-4 py-3 rounded-2xl border bg-white text-gray-800 text-base transition-colors min-h-[48px] disabled:bg-gray-50 ${
          error
            ? 'border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300'
            : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
