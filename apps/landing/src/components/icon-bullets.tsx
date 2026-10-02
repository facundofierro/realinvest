import { IconTile, type IconName } from "@/components/illustrations/icons";
import { cn } from "@/lib/utils";

export type IconBullet = { icon: IconName; title: string; text: string };

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** List of "**Title.** text" bullets, each with a small icon tile. */
export function IconBullets({
  items,
  className,
}: {
  items: readonly IconBullet[];
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-[18px]", className)}>
      {items.map((item) => (
        <li key={item.title} className="flex items-start gap-3">
          <IconTile name={item.icon} small />
          <span>
            <b className="font-semibold">{item.title}.</b>{" "}
            {capitalize(item.text)}
          </span>
        </li>
      ))}
    </ul>
  );
}
