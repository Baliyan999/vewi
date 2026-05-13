"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * VEWI Premium marketing header.
 *
 * Mobile: MENU · VEWI · ACCOUNT (label-caps text buttons).
 * Desktop: same layout, with nav links inline. Sticky, becomes subtly opaque
 * on scroll. No shadows; only a hairline bottom border.
 */
export function MarketingHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color] duration-200",
        scrolled
          ? "bg-[color:var(--color-surface)]/95 backdrop-blur-md border-b-[0.5px] border-[color:var(--color-outline-variant)]"
          : "bg-transparent border-b-[0.5px] border-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <button
          onClick={() => setOpen(!open)}
          className="label-caps text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-accent-gold)] transition-colors"
          aria-label="Menu"
        >
          <span className="hidden md:inline">Menu</span>
          <Icon name={open ? "close" : "menu"} className="md:hidden text-[22px]" />
        </button>

        <Link
          href="/"
          className="text-display-md tracking-tight text-[color:var(--color-on-surface)] hover:opacity-80 transition-opacity"
        >
          VEWI
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-on-surface-variant)]">
            {routing.locales.map((l, i) => (
              <button
                key={l}
                onClick={() => router.replace(pathname, { locale: l })}
                className="px-1 hover:text-[color:var(--color-accent-gold)] transition-colors"
              >
                {l}{i < routing.locales.length - 1 && <span className="ml-1 opacity-40">·</span>}
              </button>
            ))}
          </div>

          <Link
            href="/dashboard"
            className="label-caps text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-accent-gold)] transition-colors"
          >
            <span className="hidden md:inline">Account</span>
            <Icon name="account_circle" className="md:hidden text-[22px]" />
          </Link>
        </div>
      </div>

      {open && (
        <div className="border-t-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface)]/95 backdrop-blur-md">
          <nav className="container-page flex flex-col gap-4 py-6 label-caps">
            <a href="#how" onClick={() => setOpen(false)} className="text-[color:var(--color-on-surface)]">
              {t("howItWorks")}
            </a>
            <a href="#features" onClick={() => setOpen(false)} className="text-[color:var(--color-on-surface)]">
              {t("features")}
            </a>
            <a href="#pricing" onClick={() => setOpen(false)} className="text-[color:var(--color-on-surface)]">
              {t("pricing")}
            </a>
            <a href="#lead" onClick={() => setOpen(false)} className="text-[color:var(--color-on-surface)]">
              {t("contact")}
            </a>
            <Link href="/dashboard" onClick={() => setOpen(false)} className="text-[color:var(--color-accent-gold)]">
              {t("loginCouple")}
            </Link>
            <div className="flex gap-3 pt-2 text-[10px] tracking-widest text-[color:var(--color-on-surface-variant)]">
              {routing.locales.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    router.replace(pathname, { locale: l });
                    setOpen(false);
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
