import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale: "ru" | "uz" = "ru") {
  const d = typeof date === "string" ? new Date(date) : date;
  const map = { ru: "ru-RU", uz: "uz-UZ" } as const;
  return new Intl.DateTimeFormat(map[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
