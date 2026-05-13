"use client";

import { motion } from "motion/react";
import { Heart } from "lucide-react";

export function EmptyState({
  title,
  desc,
  brideName,
  groomName,
}: {
  title: string;
  desc: string;
  brideName: string;
  groomName: string;
}) {
  return (
    <div className="container-page py-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="surface-card mx-auto max-w-xl rounded-(--radius-xl) p-10 text-center"
      >
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-(--color-accent)/60 text-(--color-primary)">
          <Heart className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl">
          {brideName} <span className="text-gradient-gold italic">&amp;</span> {groomName}
        </h1>
        <p className="mt-3 font-display text-xl">{title}</p>
        <p className="mt-2 text-sm text-(--color-muted-foreground)">{desc}</p>
      </motion.div>
    </div>
  );
}
