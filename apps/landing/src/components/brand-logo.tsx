import { VestLogo } from "@repo/ui/components/brand/vest-logo";
import { cn } from "@/lib/utils";

/** Full Vest lockup (wordmark + "REAL ESTATE" subtitle) cropped to its artwork so it can sit inline in the header/footer. */
export function BrandLogo({
  white = false,
  className,
}: {
  white?: boolean;
  className?: string;
}) {
  return (
    <VestLogo
      forceWhite={white}
      viewBox="30 65 140 78"
      className={cn("h-11 w-auto", className)}
    />
  );
}
