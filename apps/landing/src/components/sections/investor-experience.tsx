import Image from "next/image";
import { IconBullets } from "@/components/icon-bullets";
import type { IconName } from "@/components/illustrations/icons";
import { PhoneScreenshot } from "@/components/phone-screenshot";
import { Section, SectionHeading } from "@/components/section";
import { investorExperience } from "@/content/es";

const icons: IconName[] = ["search", "trend", "card", "bell"];

export function InvestorExperience() {
  const points = investorExperience.points.map((point, i) => ({
    ...point,
    icon: icons[i],
  }));

  return (
    <Section tone="white">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow={investorExperience.eyebrow}
            title={investorExperience.title}
            lead={investorExperience.lead}
          />
          <IconBullets items={points} className="mt-7" />
        </div>
        <div className="flex justify-center rounded-[28px] bg-[linear-gradient(160deg,#EAD7F5,#F6F4F7)] px-6 py-10">
          <PhoneScreenshot
            src="/images/screenshot-investor.webp"
            alt="Oportunidades de inversión en la app del celular"
            sizes="280px"
            className="w-full max-w-[280px] shadow-[0_30px_36px_rgba(59,33,70,0.3)]"
          />
        </div>
      </div>
      <div className="mt-14 rounded-3xl border border-card-border bg-background p-4 sm:p-7">
        <Image
          src="/images/trust-loop.webp"
          alt=""
          width={1500}
          height={500}
          sizes="(min-width: 1180px) 1080px, 100vw"
          className="block h-auto w-full rounded-2xl"
        />
        {/* Columns line up with the three objects in the image (at 1/6, 1/2, 5/6). */}
        <ol className="grid grid-cols-3 gap-2 text-center text-[13px] font-semibold sm:text-[15px]">
          {investorExperience.trustLoop.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ol>
      </div>
      <p className="mt-4 text-[13px] text-[#6B5A74]">
        {investorExperience.disclaimer}
      </p>
    </Section>
  );
}
