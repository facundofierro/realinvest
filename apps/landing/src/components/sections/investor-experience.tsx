import { IconBullets } from "@/components/icon-bullets";
import type { IconName } from "@/components/illustrations/icons";
import { InvestorAppMock } from "@/components/illustrations/investor-app-mock";
import { TrustLoop } from "@/components/illustrations/trust-loop";
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
        <div className="rounded-[28px] bg-[linear-gradient(160deg,#EAD7F5,#F6F4F7)] p-4 sm:p-7">
          <InvestorAppMock />
        </div>
      </div>
      <div className="mt-14 overflow-x-auto rounded-3xl border border-card-border bg-background p-7">
        <TrustLoop
          labels={investorExperience.trustLoop}
          className="block h-auto w-full min-w-[560px]"
        />
      </div>
      <p className="mt-4 text-[13px] text-[#6B5A74]">
        {investorExperience.disclaimer}
      </p>
    </Section>
  );
}
