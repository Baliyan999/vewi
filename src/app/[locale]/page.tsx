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
import { GlobalBackground } from "@/components/marketing/global-background";

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
      <GlobalBackground />
      <MarketingHeader />
      <main className="relative">
        <Hero />
        <Stats />
        <StickyHeadline />
        <How />
        <GalleryPreview />
        <Features />
        <Pricing />
        <section id="lead" className="relative py-24 md:py-32">
          <div className="relative">
            <LeadForm />
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
