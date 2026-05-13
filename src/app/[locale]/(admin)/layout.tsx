/**
 * Admin uses the dark surface as well — it's an operator-facing app.
 */
export default function AdminSurfaceLayout({
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
