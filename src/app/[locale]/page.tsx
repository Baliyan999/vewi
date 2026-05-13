import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { Hero } from "@/components/marketing/hero";
import { Stats } from "@/components/marketing/stats";
import { StickyHeadline } from "@/components/marketing/sticky-headline";
import { How } from "@/components/marketing/how";
import { GalleryPreview } from "@/components/marketing/gallery-preview";
import { Features } from "@/components/marketing/features";
import { Pricing } from "@/components/marketing/pricing";
import { LeadForm } from "@/components/marketing/lead-form";
import { MarketingFooter } from "@/components/marketing/footer";
import { FloatingOrnaments, DriftingOrbs } from "@/components/marketing/parallax";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("title"), description: t("description") };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <MarketingHeader />
      <main className="relative">
        <Hero />
        <Stats />
        <StickyHeadline />
        <How />
        <GalleryPreview />
        <Features />
        <Pricing />
        <section id="lead" className="relative overflow-hidden py-24 md:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, transparent, oklch(95% 0.025 70) 100%)",
            }}
          />
          <DriftingOrbs variant="rose" />
          <FloatingOrnaments count={16} hueBase={20} hueSpread={60} />
          <div className="relative">
            <LeadForm />
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
