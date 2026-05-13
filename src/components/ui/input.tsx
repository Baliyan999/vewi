import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * VEWI Premium input — minimal bottom-border line, label above is set in
 * label-caps (uppercase, wide-tracked). Focus turns the underline gold.
 */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-12 w-full border-0 border-b-[0.5px] border-[color:var(--color-on-surface-variant)] bg-transparent px-0 py-2 text-[18px] leading-[1.4] text-[color:var(--color-on-surface)] placeholder:text-[color:var(--color-outline-variant)] focus:border-[color:var(--color-accent-gold)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const InputLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "label-caps text-[color:var(--color-on-surface-variant)] mb-2 block",
      className,
    )}
    {...props}
  />
));
InputLabel.displayName = "InputLabel";
