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
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-primary"
        >
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
        {hint && <p className="text-xs text-muted">{hint}</p>}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3 rounded-xl border-2 text-foreground
            bg-white placeholder:text-muted/60
            transition-colors duration-150
            focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
            ${error ? "border-error" : "border-border"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
