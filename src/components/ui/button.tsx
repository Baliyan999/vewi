import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * VEWI Premium button — rectangular with 0.5px borders, uppercase label-caps
 * text. No shadows; primary state inverts to filled, secondary stays bordered.
 * Default border-radius is 0.25rem (matches Premium design tokens).
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-[12px] tracking-[0.15em] uppercase font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 active:opacity-80 select-none",
  {
    variants: {
      variant: {
        // Filled inverse (primary call to action)
        default:
          "bg-[color:var(--color-on-surface)] text-[color:var(--color-surface)] border-[0.5px] border-[color:var(--color-on-surface)] hover:opacity-90",
        // Gold filled — used inside dark app for primary actions
        gold:
          "bg-[color:var(--color-accent-gold)] text-[color:var(--color-surface)] border-[0.5px] border-[color:var(--color-accent-gold)] hover:opacity-90",
        // Outlined (default secondary)
        outline:
          "bg-transparent text-[color:var(--color-on-surface)] border-[0.5px] border-[color:var(--color-on-surface)] hover:bg-[color:var(--color-on-surface)] hover:text-[color:var(--color-surface)]",
        // Soft outline against muted backgrounds
        ghost:
          "bg-transparent text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-accent-gold)] border-[0.5px] border-transparent",
        // Link-style — used in compact rows
        link:
          "text-[color:var(--color-accent-gold)] hover:underline underline-offset-4 px-0 border-0",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-[11px]",
        lg: "h-14 px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
