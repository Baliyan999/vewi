"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * VEWI Premium dashboard shell.
 * Top: MENU · VEWI · ACCOUNT (hairline border, sticky)
 * Bottom (mobile): Dashboard · Gallery · Guest · Settings (Material Symbols)
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("couple.nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDemo = pathname.startsWith("/dashboard/demo");

  const homePath = isDemo ? "/dashboard/demo" : "/dashboard";
  const settingsPath = isDemo ? "/dashboard/demo/settings" : "/dashboard/settings";

  const isLogin = pathname.endsWith("/dashboard/login");
  if (isLogin) return <>{children}</>;

  const items = [
    { href: homePath, label: t("albums"), icon: "dashboard" },
    { href: `${homePath}#gallery`, label: "Gallery", icon: "auto_stories" },
    { href: "/e/demo", label: "Guest", icon: "upload_file" },
    { href: settingsPath, label: t("settings"), icon: "settings" },
  ];

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Top app bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex justify-between items-center px-(--space-margin-mobile) bg-[color:var(--color-surface)]/95 backdrop-blur-sm border-b-[0.5px] border-[color:var(--color-outline-variant)]">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-[color:var(--color-on-surface)] hover:text-[color:var(--color-accent-gold)] transition-colors"
          aria-label="Menu"
        >
          <Icon name={menuOpen ? "close" : "menu"} size={24} />
        </button>
        <Link
          href={homePath as "/dashboard"}
          className="text-display-md tracking-tight text-[color:var(--color-on-surface)]"
        >
          VEWI
        </Link>
        <Link
          href={settingsPath as "/dashboard/settings"}
          className="text-[color:var(--color-on-surface)] hover:text-[color:var(--color-accent-gold)] transition-colors"
          aria-label="Account"
        >
          <Icon name="account_circle" size={24} />
        </Link>
      </header>

      {/* Slide-down menu sheet */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 left-0 right-0 z-40 border-b-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface)] py-6"
        >
          <nav className="container-page flex flex-col gap-4">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href as "/dashboard"}
                onClick={() => setMenuOpen(false)}
                className="label-caps flex items-center gap-3 text-[color:var(--color-on-surface)] hover:text-[color:var(--color-accent-gold)]"
              >
                <Icon name={it.icon} size={20} />
                {it.label}
              </Link>
            ))}
            {isDemo && (
              <span className="label-caps text-[color:var(--color-accent-gold)] mt-2">
                · Demo mode ·
              </span>
            )}
            {!isDemo && (
              <form action="/api/auth/signout" method="post" className="mt-2">
                <button
                  type="submit"
                  className="label-caps flex items-center gap-3 text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-accent-gold)]"
                >
                  <Icon name="logout" size={20} /> {t("logout")}
                </button>
              </form>
            )}
          </nav>
        </motion.div>
      )}

      {/* Main content */}
      <main className="flex-1 pt-16 pb-24 md:pb-16">{children}</main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center h-20 px-(--space-margin-mobile) bg-[color:var(--color-surface)] border-t-[0.5px] border-[color:var(--color-outline-variant)]">
        {items.map((it) => {
          const active =
            pathname === it.href ||
            (it.href.includes("#") && pathname === it.href.split("#")[0]);
          return (
            <Link
              key={it.href}
              href={it.href as "/dashboard"}
              className={cn(
                "flex flex-col items-center justify-center pt-2 w-full h-full transition-colors active:scale-95",
                active
                  ? "text-[color:var(--color-accent-gold)] border-t-[0.5px] border-[color:var(--color-accent-gold)]"
                  : "text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-accent-gold)]",
              )}
            >
              <Icon
                name={it.icon}
                size={22}
                fill={active ? 1 : 0}
                weight={active ? 400 : 300}
                className="mb-1"
              />
              <span className="label-caps text-[10px]">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// Legacy export kept for one stray import
export function dashboardIconColor() {
  return null;
}
