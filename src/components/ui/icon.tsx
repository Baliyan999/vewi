import { cn } from "@/lib/utils";

/**
 * Material Symbols Outlined wrapper.
 *
 * VEWI Premium uses outlined material symbols as the icon set. The CSS
 * font-variation-settings give fine control over weight/fill/grade/optical
 * size — the four sliders that distinguish Material Symbols from Icons.
 */
type Props = {
  name: string;
  /** 100–700 */
  weight?: number;
  /** 0 = outlined, 1 = filled */
  fill?: 0 | 1;
  /** Tailwind size class shorthand like "text-[20px]" */
  className?: string;
  /** Inline pixel size — convenient when class is verbose */
  size?: number;
};

export function Icon({
  name,
  weight = 300,
  fill = 0,
  className,
  size,
}: Props) {
  return (
    <span
      aria-hidden
      className={cn("material-symbols-outlined leading-none select-none", className)}
      style={{
        fontVariationSettings: `'wght' ${weight}, 'FILL' ${fill}, 'GRAD' 0, 'opsz' 24`,
        fontSize: size ? `${size}px` : undefined,
      }}
    >
      {name}
    </span>
  );
}
