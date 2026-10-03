import Image from "next/image";
import { Section, SectionHeading, cardClass } from "@/components/section";
import { payments } from "@/content/es";
import { cn } from "@/lib/utils";

const images: Record<(typeof payments.points)[number]["key"], string> = {
  cards: "/images/payment-cards.webp",
  qr: "/images/payment-qr.webp",
  transfer: "/images/payment-transfer.webp",
  abroad: "/images/payment-abroad.webp",
};

export function Payments() {
  const { crypto } = payments;
  return (
    <Section tone="white">
      <SectionHeading
        eyebrow={payments.eyebrow}
        title={payments.title}
        lead={payments.text}
        className="mb-10"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {payments.points.map((point) => (
          <div
            key={point.key}
            className={cn(
              cardClass,
              "group bg-background transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1.5 hover:border-[#DCC4EC] hover:shadow-[0_14px_32px_-12px_rgba(74,20,110,0.25)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
            )}
          >
            <Image
              src={images[point.key]}
              alt=""
              width={72}
              height={72}
              className="mb-4 size-[72px] transition-transform duration-300 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <h3 className="mb-2 text-[17px] font-semibold tracking-[-0.01em]">
              {point.title}
            </h3>
            <p className="text-[14.5px] text-muted-foreground">{point.text}</p>
          </div>
        ))}
      </div>
      <div
        className={cn(
          cardClass,
          "mt-5 flex flex-wrap items-center gap-6 border-[#DCC4EC] bg-tint",
        )}
      >
        <Image
          src="/images/payments-coin.webp"
          alt=""
          width={84}
          height={84}
          className="size-[84px] flex-none"
        />
        <div className="min-w-[min(100%,260px)] flex-1">
          <p className="mb-1.5 font-mono text-xs font-medium uppercase tracking-[0.12em] text-brand">
            {crypto.eyebrow}
          </p>
          <h3 className="mb-2 text-[19px] font-semibold tracking-[-0.01em]">
            {crypto.title}
          </h3>
          <p className="text-[15.5px] text-muted-foreground">{crypto.text}</p>
          <p className="mt-2.5 text-[13px] text-[#6B5A74]">{crypto.note}</p>
        </div>
      </div>
    </Section>
  );
}
