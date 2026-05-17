import Image from "next/image";
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
        <div className="flex items-center gap-2.5 font-display text-2xl text-(--color-foreground)">
          <Image
            src="/memour-logo.png"
            alt="Memour"
            width={40}
            height={40}
            className="h-9 w-9"
          />
          Memour
        </div>
        <p className="max-w-md">{t("tagline")}</p>
        <p className="text-xs">© {new Date().getFullYear()} · {t("rights")}</p>
      </div>
    </footer>
  );
}
