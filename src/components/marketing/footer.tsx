import { useTranslations } from "next-intl";

export function MarketingFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="relative border-t border-(--color-border)/70 py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-3xl"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(80% 0.06 35) 50%, transparent)",
        }}
      />
      <div className="container-page flex flex-col items-center gap-4 text-center text-sm text-(--color-muted-foreground)">
        <div className="font-display text-2xl text-(--color-foreground)">
          <span className="text-gradient-gold">⌘</span> QR-Фотограф
        </div>
        <p className="max-w-md">{t("tagline")}</p>
        <p className="text-xs">© {new Date().getFullYear()} · {t("rights")}</p>
      </div>
    </footer>
  );
}
