import { cn } from "@/lib/utils";

/**
 * The signature VEWI motif: a 0.5px hairline punctuated every 8–12px by gaps
 * the colour of the background, mimicking the perforations on a film
 * negative. Use between sections instead of full-width dividers.
 */
export function FilmStrip({
  className,
  vertical = false,
}: {
  className?: string;
  vertical?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        vertical ? "w-px h-full" : "h-px w-full",
        "film-strip",
        className,
      )}
    />
  );
}
