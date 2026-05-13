import { useTranslations } from "next-intl";
import { FilmStrip } from "@/components/ui/film-strip";

export function MarketingFooter() {
  const t = useTranslations("footer");
  return (
    <footer className="relative">
      <div className="container-page">
        <FilmStrip />
      </div>
      <div className="container-page py-14 flex flex-col items-center gap-4 text-center">
        <div className="text-display-md tracking-tight text-[color:var(--color-on-surface)]">
          VEWI
        </div>
        <p className="text-body-md max-w-md">{t("tagline")}</p>
        <p className="label-caps text-[color:var(--color-on-surface-variant)]">
          © {new Date().getFullYear()} · {t("rights")}
        </p>
      </div>
    </footer>
  );
}
