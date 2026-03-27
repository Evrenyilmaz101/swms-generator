"use client";

import { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, options, placeholder, id, className = "", ...props },
    ref
  ) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1">
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-primary"
        >
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-4 py-3 rounded-xl border-2 text-foreground
            bg-white appearance-none cursor-pointer
            transition-colors duration-150
            focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
            ${error ? "border-error" : "border-border"}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
