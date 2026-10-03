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
    <>
      <Section tone="white" className="relative z-10 !pb-0">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow={investorExperience.eyebrow}
              title={investorExperience.title}
              lead={investorExperience.lead}
            />
            <IconBullets items={points} className="mt-7" />
          </div>
          <div className="flex justify-center rounded-[28px] bg-[linear-gradient(160deg,#F8F2FC,#FDFCFE)] px-6 py-10">
            <PhoneScreenshot
              src="/images/screenshot-investor.webp"
              alt="Oportunidades de inversión en la app del celular"
              sizes="220px"
              className="w-full max-w-[220px] shadow-[0_30px_36px_rgba(59,33,70,0.3)]"
            />
          </div>
        </div>
      </Section>
      <Section tone="white" className="!pb-10 !pt-0 md:!pb-14">
        <Image
          src="/images/trust-loop-white.webp"
          alt=""
          width={1500}
          height={500}
          sizes="(min-width: 1180px) 1080px, 100vw"
          className="-mt-3 block h-auto w-full sm:-mt-6 lg:-mt-10"
        />
        {/* One label at a time, cycling like a carousel. */}
        <ol className="-mt-4 grid grid-cols-3 gap-2 sm:-mt-10 lg:-mt-16">
          {investorExperience.trustLoop.map((label, i) => (
            <li
              key={label}
              className="trust-label flex h-[64px] items-start justify-center text-center font-sans font-bold tracking-tight text-[20px] leading-tight sm:h-[96px] sm:text-[32px] lg:h-[120px] lg:text-[48px]"
              style={{ animationDelay: `${i * 3}s` }}
            >
              {label}
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
