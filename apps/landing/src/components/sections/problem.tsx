import { IconTile, type IconName } from "@/components/illustrations/icons";
import { ProblemBeforeAfter } from "@/components/illustrations/problem-before-after";
import { Section, SectionHeading, cardClass } from "@/components/section";
import { problem } from "@/content/es";
import { cn } from "@/lib/utils";

const icons: IconName[] = ["grid", "users", "doc", "clock"];

export function Problem() {
  return (
    <Section className="pt-10 md:pt-14">
      <SectionHeading
        eyebrow={problem.eyebrow}
        title={problem.title}
        lead={problem.text}
        className="mb-10"
      />
      <div className={cn(cardClass, "mb-5 overflow-x-auto p-5")}>
        <ProblemBeforeAfter
          before={problem.illustration.before}
          after={problem.illustration.after}
          className="block h-auto w-full min-w-[640px]"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {problem.items.map((item, i) => (
          <div key={item.title} className={cardClass}>
            <IconTile name={icons[i]} className="mb-4" />
            <h3 className="mb-2 text-[19px] font-semibold tracking-[-0.01em]">
              {item.title}
            </h3>
            <p className="text-[15.5px] text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
