import Image from "next/image";
import { CtaLink } from "@/components/cta-link";
import { IconTile, type IconName } from "@/components/illustrations/icons";
import { CheckList, Section, SectionHeading } from "@/components/section";
import { launch } from "@/content/es";

const icons: IconName[] = ["calendar", "userPlus", "chart", "flag", "stairs"];

export function LaunchDay() {
  return (
    <Section id="lanzamientos" tone="dark">
      <SectionHeading
        dark
        eyebrow={launch.eyebrow}
        title={launch.title}
        lead={launch.text}
        className="mb-10"
      />
      <Image
        src="/images/launch-day.webp"
        alt=""
        width={1800}
        height={770}
        sizes="(min-width: 1180px) 1132px, 100vw"
        className="mb-2 hidden h-auto w-full rounded-3xl sm:block"
      />
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {launch.steps.map((step, i) => (
          <li key={step.title} className="rounded-[18px] bg-dark-card p-[22px]">
            <IconTile name={icons[i]} dark className="mb-4" />
            <b className="mb-1.5 block text-[17px] font-semibold">
              <span className="sm:hidden">{i + 1}. </span>
              {step.title}
            </b>
            <span className="text-[14.5px] text-dark-text">{step.text}</span>
          </li>
        ))}
      </ol>
      <div className="mt-14 grid items-start gap-10 lg:grid-cols-2">
        <CheckList dark items={launch.benefits} />
        <div>
          <p className="mb-6 text-[15.5px] text-dark-text">{launch.note}</p>
          <CtaLink href={launch.cta.href} variant="light">
            {launch.cta.label}
          </CtaLink>
        </div>
      </div>
    </Section>
  );
}
