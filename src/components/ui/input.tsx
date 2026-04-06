"use client";

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = "", ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--c-text-dim)]"
        >
          {label}
          {props.required && <span className="text-[var(--c-yellow)] ml-1">*</span>}
        </label>
        {hint && <p className="text-xs text-white/25">{hint}</p>}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3 text-white
            bg-[var(--c-dark)] placeholder:text-white/15
            border border-white/[0.08]
            transition-all duration-150
            focus:outline-none focus:border-[var(--c-yellow)] focus:ring-1 focus:ring-[var(--c-yellow)]/20
            ${error ? "border-red-400/60" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
