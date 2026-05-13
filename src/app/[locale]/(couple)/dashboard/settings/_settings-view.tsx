"use client";

import { motion } from "motion/react";
import { Send, Phone, Globe2, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  brideName: string;
  groomName: string;
  phone: string;
  telegramConnected: boolean;
  botUsername: string;
  labels: {
    title: string;
    phone: string;
    telegram: string;
    telegramHint: string;
    telegramConnect: string;
    language: string;
    save: string;
  };
};

export function SettingsView({
  brideName,
  groomName,
  phone,
  telegramConnected,
  botUsername,
  labels,
}: Props) {
  return (
    <div className="container-page py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <p className="text-xs uppercase tracking-[0.28em] text-(--color-primary)">
          {labels.title}
        </p>
        <h1 className="mt-1 font-display text-4xl md:text-5xl">
          {brideName} <span className="text-gradient-gold italic">&amp;</span> {groomName}
        </h1>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section
          icon={<Phone className="h-5 w-5" />}
          title={labels.phone}
          delay={0}
        >
          <div className="rounded-lg bg-(--color-muted)/60 px-4 py-3 font-mono">
            {phone}
          </div>
        </Section>

        <Section
          icon={<Send className="h-5 w-5 text-[#229ED9]" />}
          title={labels.telegram}
          delay={0.05}
        >
          <p className="text-sm text-(--color-muted-foreground)">{labels.telegramHint}</p>
          <div className="mt-4">
            {telegramConnected ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 text-sm text-emerald-700">
                <Heart className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" />
                Подключено
              </span>
            ) : (
              <a
                href={`https://t.me/${botUsername}?start=link`}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                {labels.telegramConnect}
              </a>
            )}
          </div>
        </Section>

        <Section
          icon={<Globe2 className="h-5 w-5" />}
          title={labels.language}
          delay={0.1}
        >
          <div className="flex gap-2">
            <a
              href="/ru/dashboard/settings"
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            >
              Русский
            </a>
            <a
              href="/uz/dashboard/settings"
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            >
              O&apos;zbekcha
            </a>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  delay,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="surface-card rounded-(--radius-lg) border-0">
        <CardHeader>
          <div className="mb-1 grid h-10 w-10 place-items-center rounded-lg bg-(--color-accent)/60">
            {icon}
          </div>
          <CardTitle className="font-display text-xl">{title}</CardTitle>
          <CardDescription className="sr-only">{title}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}
