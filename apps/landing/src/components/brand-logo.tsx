import { VestLogo } from "@repo/ui/components/brand/vest-logo";
import { cn } from "@/lib/utils";

/** Vest lockup cropped to its artwork so it can sit inline in the header/footer. */
export function BrandLogo({
  white = false,
  className,
}: {
  white?: boolean;
  className?: string;
}) {
  return (
    <VestLogo
      showSubtitle={false}
      forceWhite={white}
      viewBox="30 79 140 62"
      className={cn("h-9 w-auto", className)}
    />
  );
}
