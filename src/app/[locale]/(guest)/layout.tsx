/**
 * Guest routes (and the live slideshow) use the dark Premium surface.
 * Setting `data-surface="dark"` here flips all CSS tokens via globals.css.
 */
export default function GuestSurfaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-surface="dark" className="min-h-dvh bg-[color:var(--color-background)] text-[color:var(--color-on-surface)]">
      {children}
    </div>
  );
}
