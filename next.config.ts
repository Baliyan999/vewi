import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase Storage public URLs
      { protocol: "https", hostname: "*.supabase.co" },
      // Cloudflare R2 public buckets (optional)
      { protocol: "https", hostname: "*.r2.dev" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "20mb" },
  },
};

export default withNextIntl(nextConfig);
