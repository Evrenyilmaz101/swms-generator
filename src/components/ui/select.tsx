"use client";

import { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, id, className = "", ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        <label htmlFor={selectId} className="block text-sm font-medium text-[var(--c-text-dim)]">
          {label}
          {props.required && <span className="text-[var(--c-yellow)] ml-1">*</span>}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-4 py-3 text-white
            bg-[var(--c-dark)] appearance-none cursor-pointer
            border border-white/[0.08]
            transition-all duration-150
            focus:outline-none focus:border-[var(--c-yellow)] focus:ring-1 focus:ring-[var(--c-yellow)]/20
            ${error ? "border-red-400/60" : ""}
            ${className}
          `}
          {...props}
        >
          {placeholder && <option value="" disabled className="bg-[var(--c-dark)] text-white/30">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--c-dark)] text-white">{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
