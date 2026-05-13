"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "sticky top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-300",
        scrolled
          ? "bg-white/70 backdrop-blur-md shadow-[0_1px_0_oklch(91%_0.015_70)]"
          : "bg-transparent",
      )}
    >
      <div className="container-page flex h-18 items-center justify-between gap-4 py-4">
        <Link href="/" className="group flex items-center gap-2.5 font-display text-xl">
          <span aria-hidden className="text-2xl text-gradient-gold">⌘</span>
          <span>QR-Фотограф</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {[
            ["features", t("features")],
            ["how", t("howItWorks")],
            ["pricing", t("pricing")],
            ["lead", t("contact")],
          ].map(([id, label]) => (
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

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-0.5 rounded-full border border-(--color-border) bg-white/60 p-0.5 backdrop-blur md:flex">
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
              "hidden md:inline-flex bg-white/70 backdrop-blur",
            )}
          >
            {t("loginCouple")}
          </Link>
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-(--color-border) bg-white/70 backdrop-blur md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-(--color-border) bg-white/90 backdrop-blur md:hidden"
        >
          <div className="container-page flex flex-col gap-4 py-5 text-sm">
            {[
              ["features", t("features")],
              ["how", t("howItWorks")],
              ["pricing", t("pricing")],
              ["lead", t("contact")],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              {t("loginCouple")}
            </Link>
            <div className="flex gap-3 pt-2">
              {routing.locales.map((l) => (
                <button
                  key={l}
                  onClick={() => router.replace(pathname, { locale: l })}
                  className="text-xs uppercase tracking-widest"
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
