"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Images, Palette, Settings, LogOut, Sparkles, ArrowLeft } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("couple.nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const isDemo = pathname.startsWith("/dashboard/demo");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const homePath = isDemo ? "/dashboard/demo" : "/dashboard";
  const settingsPath = isDemo ? "/dashboard/demo/settings" : "/dashboard/settings";

  const items = [
    { href: homePath, label: t("albums"), icon: Images },
    { href: settingsPath, label: t("settings"), icon: Settings },
  ];

  const isLoginRoute = pathname.endsWith("/dashboard/login");
  if (isLoginRoute) return <>{children}</>;

  return (
    <div className="relative min-h-dvh">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 900px 600px at 10% -10%, oklch(90% 0.05 25 / 0.4), transparent 60%), radial-gradient(ellipse 800px 600px at 95% 100%, oklch(90% 0.05 85 / 0.4), transparent 60%)",
        }}
      />

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "sticky top-0 z-30 transition-[background-color,box-shadow,backdrop-filter] duration-300",
          scrolled
            ? "bg-white/75 backdrop-blur-md shadow-[0_1px_0_oklch(91%_0.015_70)]"
            : "bg-transparent",
        )}
      >
        <div className="container-page flex h-18 items-center justify-between py-4">
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-display text-lg md:text-xl"
          >
            <span aria-hidden className="text-2xl text-gradient-gold">⌘</span>
            <span className="hidden sm:inline">Memour</span>
            <span className="ml-1 hidden text-xs uppercase tracking-[0.2em] text-(--color-muted-foreground) sm:inline">
              · кабинет
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {items.map((it) => {
              const active = pathname === it.href;
              const Icon = it.icon;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors",
                    active
                      ? "text-(--color-foreground)"
                      : "text-(--color-muted-foreground) hover:text-(--color-foreground)",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="navPill"
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                      className="absolute inset-0 -z-10 rounded-full bg-white shadow-(--shadow-soft)"
                    />
                  )}
                  <Icon className="h-4 w-4" />
                  {it.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {isDemo && (
              <span className="hidden items-center gap-1.5 rounded-full bg-(--color-accent)/60 px-3 py-1.5 text-[10px] uppercase tracking-widest text-(--color-primary) sm:inline-flex">
                <Sparkles className="h-3 w-3" /> {t("demo")}
              </span>
            )}
            {!isDemo && (
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="grid h-10 w-10 place-items-center rounded-full border border-(--color-border) bg-white/70 text-(--color-muted-foreground) backdrop-blur transition-colors hover:text-(--color-foreground)"
                  aria-label={t("logout")}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.header>

      <nav className="container-page flex gap-2 overflow-x-auto pb-2 pt-2 md:hidden">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs",
                active
                  ? "border-transparent bg-white shadow-(--shadow-soft) text-(--color-foreground)"
                  : "border-(--color-border) bg-white/60 text-(--color-muted-foreground)",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {it.label}
            </Link>
          );
        })}
      </nav>

      {pathname.includes("/event/") && (
        <div className="container-page pt-2">
          <Link
            href={homePath as "/dashboard"}
            className="inline-flex items-center gap-1.5 text-xs text-(--color-muted-foreground) hover:text-(--color-foreground)"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> ко всем событиям
          </Link>
        </div>
      )}

      <main>{children}</main>
    </div>
  );
}

export function dashboardIconColor() {
  return Palette;
}
