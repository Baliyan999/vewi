import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "VEWI · Wedding OS", template: "%s · VEWI" },
  description:
    "VEWI — Wedding OS: QR на столах, цифровой одноразовый фотоаппарат, единый кураторский альбом.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
