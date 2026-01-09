import { VestLogo } from "@repo/ui/components/brand/vest-logo";
import { VestRealState } from "@repo/ui/components/brand/vest-real-state";

export default function TestPage() {
  return (
    <div className="p-8 space-y-12 min-h-screen bg-gray-50">
      <section>
        <h2 className="mb-4 text-2xl font-bold">
          VestLogo Variants
        </h2>
        <div className="grid grid-cols-2 gap-8 items-center p-6 bg-white rounded-xl shadow-sm md:grid-cols-4">
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              No Subtitle
            </span>
            <VestLogo
              showSubtitle={false}
            />
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              No Background
            </span>
            <VestLogo />
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Force White
            </span>
            <div className="bg-[#5B1187] p-4 rounded">
              <VestLogo forceWhite />
            </div>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Small
            </span>
            <VestLogo className="w-20 h-20" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">
          VestRealState Variants
        </h2>
        <div className="grid grid-cols-2 gap-8 items-center p-6 bg-white rounded-xl shadow-sm md:grid-cols-3">
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Dark (Default)
            </span>
            <VestRealState theme="dark" />
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Light
            </span>
            <VestRealState theme="light" />
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Ghost Dark
            </span>
            <VestRealState theme="ghost-dark" />
          </div>
        </div>
      </section>

      <section className="p-8 bg-white rounded-xl shadow-sm">
        <h2 className="mb-4 text-2xl font-bold">
          Side by Side Comparison
        </h2>
        <div className="flex flex-wrap gap-12 items-end">
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              VestLogo
            </span>
            <VestLogo className="w-32 h-32" />
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              VestRealState (Brand)
            </span>
            <VestRealState theme="dark" />
          </div>
        </div>
      </section>
    </div>
  );
}
