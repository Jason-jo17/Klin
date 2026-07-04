"use client";

import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "./cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  maskable?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, maskable = false, type = "text", className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [revealed, setRevealed] = useState(false);
    const resolvedType = maskable ? (revealed ? "text" : "password") : type;

    return (
      <div className="kiln-field">
        {label && (
          <label className="kiln-field__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <div className="kiln-input-wrap">
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={cn("kiln-input", "kiln-focus-ring", error && "kiln-input--error", className)}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {maskable && (
            <button
              type="button"
              className="kiln-input__toggle kiln-focus-ring"
              onClick={() => setRevealed((r) => !r)}
              aria-label={revealed ? "Hide value" : "Show value"}
            >
              {revealed ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="kiln-field__error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
