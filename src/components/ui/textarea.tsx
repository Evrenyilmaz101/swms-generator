"use client";

import { forwardRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className = "", ...props }, ref) => {
    const textareaId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        <label htmlFor={textareaId} className="block text-sm font-medium text-[var(--c-text-dim)]">
          {label}
          {props.required && <span className="text-[var(--c-yellow)] ml-1">*</span>}
        </label>
        {hint && <p className="text-xs text-white/25">{hint}</p>}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-4 py-3 text-white
            bg-[var(--c-dark)] placeholder:text-white/15 resize-y
            border border-white/[0.08]
            transition-all duration-150
            focus:outline-none focus:border-[var(--c-yellow)] focus:ring-1 focus:ring-[var(--c-yellow)]/20
            ${error ? "border-red-400/60" : ""}
            ${className}
          `}
          rows={4}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
