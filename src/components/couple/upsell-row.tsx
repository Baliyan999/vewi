"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { Clock, BookOpen, UsbIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  requestExtension,
  requestPrint,
} from "@/app/[locale]/(couple)/dashboard/event/[id]/_actions";

type Extension = {
  id: string;
  extends_by_days: number;
  applied_at: string | null;
};

type Props = {
  event: { id: string; expires_at: string };
  extensions: Extension[];
  demo?: boolean;
};

export function UpsellRow({ event, extensions, demo = false }: Props) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(event.expires_at).getTime() - Date.now()) / 86_400_000),
  );
  const totalExtended = extensions
    .filter((e) => e.applied_at)
    .reduce((sum, e) => sum + e.extends_by_days, 0);

  async function ext(days: number, price: number) {
    if (demo) {
      setMsg("Демо: запрос на продление принят");
      return;
    }
    start(async () => {
      const res = await requestExtension(event.id, days, price);
      setMsg(res.ok ? "Заявка отправлена — свяжемся для оплаты" : res.error);
    });
  }

  async function print(kind: "album" | "usb", price: number) {
    if (demo) {
      setMsg("Демо: заявка принята");
      return;
    }
    start(async () => {
      const res = await requestPrint(event.id, kind, price);
      setMsg(res.ok ? "Заявка отправлена" : res.error);
    });
  }

  return (
    <section className="container-page pb-10">
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-4 font-display text-2xl"
      >
        Ваши воспоминания — на дольше
      </motion.h3>
      <div className="grid gap-4 md:grid-cols-3">
        <UpsellCard
          icon={<Clock className="h-5 w-5" />}
          title="Сохранить альбом дольше"
          desc={`Осталось ${daysLeft} дн.${totalExtended ? ` · уже продлено на ${totalExtended} дн.` : ""}`}
          accent="rose"
        >
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" disabled={pending} onClick={() => ext(30, 50_000)}>
              +30 дней · 50k
            </Button>
            <Button size="sm" variant="outline" disabled={pending} onClick={() => ext(90, 120_000)}>
              +90 дней · 120k
            </Button>
          </div>
        </UpsellCard>

        <UpsellCard
          icon={<BookOpen className="h-5 w-5" />}
          title="Печатный фотоальбом"
          desc="Авто-вёрстка по лучшим кадрам · от 590 000 UZS"
          accent="champagne"
        >
          <div className="mt-4">
            <Button size="sm" variant="outline" disabled={pending} onClick={() => print("album", 590_000)}>
              Заказать
            </Button>
          </div>
        </UpsellCard>

        <UpsellCard
          icon={<UsbIcon className="h-5 w-5" />}
          title="Брендированная USB-флешка"
          desc="Подарочная упаковка с именами · от 250 000 UZS"
          accent="rose"
        >
          <div className="mt-4">
            <Button size="sm" variant="outline" disabled={pending} onClick={() => print("usb", 250_000)}>
              Заказать
            </Button>
          </div>
        </UpsellCard>
      </div>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card mt-4 rounded-(--radius-lg) p-3 text-sm"
        >
          {msg}
        </motion.div>
      )}
    </section>
  );
}

function UpsellCard({
  icon,
  title,
  desc,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: "rose" | "champagne";
  children: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="surface-card relative overflow-hidden rounded-(--radius-lg) p-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl opacity-60"
        style={{
          background:
            accent === "rose"
              ? "oklch(82% 0.06 25 / 0.6)"
              : "oklch(90% 0.05 85 / 0.6)",
        }}
      />
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-(--color-accent)/60 text-(--color-primary)">
        {icon}
      </div>
      <h4 className="font-display text-xl">{title}</h4>
      <p className="mt-1 text-sm text-(--color-muted-foreground)">{desc}</p>
      {children}
    </motion.div>
  );
}
