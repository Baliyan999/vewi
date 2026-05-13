/**
 * Couple dashboard uses the dark Premium surface — analog "cinema room"
 * feel for the album experience.
 */
export default function CoupleSurfaceLayout({
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
