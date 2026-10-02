import { IconBullets } from "@/components/icon-bullets";
import type { IconName } from "@/components/illustrations/icons";
import { PhoneScreenshot } from "@/components/phone-screenshot";
import { Section, SectionHeading } from "@/components/section";
import { buyerPortal } from "@/content/es";
import { flags } from "@/content/flags";

const icons: Record<(typeof buyerPortal.points)[number]["key"], IconName> = {
  progress: "image",
  payments: "card",
  documents: "doc",
  ai: "spark",
  notifications: "bell",
};

export function BuyerPortal() {
  const points = buyerPortal.points
    .filter((point) => point.key !== "ai" || flags.showAiAssistantBullet)
    .map((point) => ({ ...point, icon: icons[point.key] }));

  return (
    <Section containerClassName="grid items-center gap-14 lg:grid-cols-2">
      <div className="flex justify-center rounded-[28px] bg-[linear-gradient(160deg,#EAD7F5,#F6F4F7)] px-6 py-10">
        <PhoneScreenshot
          src="/images/screenshot-portal.webp"
          alt="Ficha del proyecto en el celular: fotos, lanzamiento y fases de construcción"
          sizes="280px"
          className="w-full max-w-[280px] shadow-[0_30px_36px_rgba(59,33,70,0.3)]"
        />
      </div>
      <div>
        <SectionHeading
          eyebrow={buyerPortal.eyebrow}
          title={buyerPortal.title}
          lead={buyerPortal.text}
        />
        <IconBullets items={points} className="mt-7" />
        <p className="mt-8 max-w-[30ch] text-xl font-semibold leading-[1.3] tracking-[-0.01em] text-brand">
          {buyerPortal.highlight}
        </p>
      </div>
    </Section>
  );
}
