import { Section, SectionHeading } from "@/components/section";
import { ProblemSplit } from "@/components/sections/problem-split";
import { problem } from "@/content/es";

export function Problem() {
  return (
    <Section className="parallax-gap-close relative z-[1] pt-10 md:pt-14">
      <SectionHeading
        eyebrow={problem.eyebrow}
        title={problem.title}
        lead={problem.text}
        titleClassName="max-w-[28ch]"
        leadClassName="max-w-[110ch]"
        className="mb-10"
      />
      <div className="overflow-clip rounded-[20px] border border-card-border bg-card">
        <figure className="border-b border-card-border">
          <ProblemSplit />
        </figure>
        <div className="grid gap-px bg-card-border sm:grid-cols-2 lg:grid-cols-4">
          {problem.items.map((item) => (
            <div key={item.title} className="group bg-card p-7">
              <div className="origin-left transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                <h3 className="mb-2 text-[19px] font-semibold tracking-[-0.01em]">
                  {item.title}
                </h3>
                <p className="text-[15.5px] text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
