"use client";

import { motion } from "motion/react";
import { Settings, Sparkles, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SetupRequired({ demoHref }: { demoHref: string }) {
  return (
    <div className="container-page flex min-h-dvh items-center justify-center py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="surface-card relative w-full max-w-md overflow-hidden rounded-(--radius-xl) p-8 text-center"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-(--color-rose)/30 blur-3xl"
        />
        <div className="relative">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-(--color-accent)/60 text-(--color-primary)">
            <Settings className="h-6 w-6" />
          </div>
          <h1 className="font-display text-3xl">Подключение ещё не настроено</h1>
          <p className="mt-3 text-sm text-(--color-muted-foreground)">
            Для входа в реальный кабинет нужен Supabase-проект. Скопируйте ключи
            из <code className="rounded bg-(--color-muted) px-1 py-0.5 text-xs">supabase.com</code>{" "}
            в <code className="rounded bg-(--color-muted) px-1 py-0.5 text-xs">.env.local</code>.
          </p>
          <a
            href={demoHref}
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-6 inline-flex shadow-(--shadow-soft)",
            )}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Посмотреть демо-кабинет
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
