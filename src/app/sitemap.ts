import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();
  return routing.locales.map((locale) => ({
    url: locale === routing.defaultLocale ? site : `${site}/${locale}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1,
  }));
}
