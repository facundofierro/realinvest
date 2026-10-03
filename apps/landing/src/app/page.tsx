import { ScrollProgress } from "@/components/scroll-progress";
import { BuyerPortal } from "@/components/sections/buyer-portal";
import { FaqSection } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Inventory } from "@/components/sections/inventory";
import { InvestorExperience } from "@/components/sections/investor-experience";
import { KnowYourBuyers } from "@/components/sections/know-your-buyers";
import { LaunchDay } from "@/components/sections/launch-day";
import { Payments } from "@/components/sections/payments";
import { Problem } from "@/components/sections/problem";
import { Services } from "@/components/sections/services";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { faq } from "@/content/es";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function Home() {
  return (
    <>
      <SiteHeader />
      <ScrollProgress />
      <main id="top">
        <Hero />
        <Problem />
        <Inventory />
        <BuyerPortal />
        <InvestorExperience />
        <LaunchDay />
        <KnowYourBuyers />
        <Payments />
        <Services />
        <HowItWorks />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
