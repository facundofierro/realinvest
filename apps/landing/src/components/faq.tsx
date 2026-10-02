/** FAQ list built on native <details>/<summary> (no JS needed). */
export function Faq({
  items,
}: {
  items: readonly { q: string; a: string }[];
}) {
  return (
    <div>
      {items.map((item) => (
        <details key={item.q} className="group border-b border-[#E0D6E6]">
          <summary className="flex min-h-11 cursor-pointer list-none justify-between gap-4 py-[22px] text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              aria-hidden="true"
              className="text-2xl font-normal leading-none text-brand"
            >
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">–</span>
            </span>
          </summary>
          <p className="mb-[22px] max-w-[68ch] text-muted-foreground">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
