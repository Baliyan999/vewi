"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * MarketingHeader — floating pill navbar.
 *
 * The outer <motion.header> is sticky-positioned with a small top
 * offset so the visible bar appears to hover above the page. Inside,
 * a max-w-5xl pill is centered horizontally with rounded-full corners,
 * a frosted-glass backdrop blur, and a soft drop shadow that
 * intensifies once the user scrolls past the first 12px.
 *
 * Mobile dropdown is a separate pill that drops below the main one
 * (not attached) so the floating feel is preserved even when the menu
 * is open.
 */
export function MarketingHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    ["features", t("features")],
    ["how", t("howItWorks")],
    ["pricing", t("pricing")],
    ["lead", t("contact")],
  ] as const;

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-3 z-50 md:top-5"
    >
      <div className="container-page">
        <div
          className={cn(
            "mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 rounded-full border pl-4 pr-2 transition-all duration-300 md:h-16 md:pl-6 md:pr-3",
            scrolled
              ? "border-white/60 bg-white/85 shadow-[0_14px_40px_-14px_rgb(160_110_90_/_0.45)] backdrop-blur-2xl"
              : "border-white/40 bg-white/55 shadow-[0_8px_28px_-12px_rgb(160_110_90_/_0.25)] backdrop-blur-xl",
          )}
        >
          <Link
            href="/"
            className="group flex items-center gap-2 whitespace-nowrap font-display text-base md:text-lg"
          >
            <span aria-hidden className="text-xl text-gradient-gold md:text-2xl">
              ⌘
            </span>
            <span>Memour</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm md:flex">
            {navItems.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="group relative text-(--color-muted-foreground) transition-colors hover:text-(--color-foreground)"
              >
                {label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-(--color-primary) transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-0.5 rounded-full border border-(--color-border)/60 bg-white/70 p-0.5 backdrop-blur md:flex">
              {routing.locales.map((l) => (
                <button
                  key={l}
                  onClick={() => router.replace(pathname, { locale: l })}
                  className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest text-(--color-muted-foreground) transition-colors hover:bg-white hover:text-(--color-foreground)"
                >
                  {l}
                </button>
              ))}
            </div>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                // Override default rounded-md to match the pill
                // aesthetic of the floating navbar.
                "hidden rounded-full border-(--color-border)/60 bg-white/80 px-4 backdrop-blur md:inline-flex",
              )}
            >
              {t("loginCouple")}
            </Link>
            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-(--color-border)/60 bg-white/80 backdrop-blur md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown — its own pill below the main bar so the
            floating effect is preserved when the menu opens. */}
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-3 max-w-5xl rounded-(--radius-xl) border border-white/60 bg-white/90 shadow-[0_14px_40px_-14px_rgb(160_110_90_/_0.4)] backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-5 text-sm">
              {navItems.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className="text-(--color-muted-foreground) transition-colors hover:text-(--color-foreground)"
                >
                  {label}
                </a>
              ))}
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="text-(--color-foreground)"
              >
                {t("loginCouple")}
              </Link>
              <div className="flex gap-3 pt-2">
                {routing.locales.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      router.replace(pathname, { locale: l });
                      setOpen(false);
                    }}
                    className="rounded-full border border-(--color-border)/60 bg-white/80 px-3 py-1 text-[10px] uppercase tracking-widest"
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
