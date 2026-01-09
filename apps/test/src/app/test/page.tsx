import { VestLogo } from "@repo/ui/components/brand/vest-logo";
import { VestRealState } from "@repo/ui/components/brand/vest-real-state";

export default function TestPage() {
  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      <section>
        <h2 className="text-2xl font-bold mb-4">VestLogo Variants</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center bg-white p-6 rounded-xl shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">Default</span>
            <VestLogo />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">No Subtitle</span>
            <VestLogo showSubtitle={false} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">No Background</span>
            <VestLogo showBackground={false} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">Force White</span>
            <div className="bg-[#5B1187] p-4 rounded">
              <VestLogo forceWhite showBackground={false} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">Small</span>
            <VestLogo className="w-20 h-20" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">VestRealState Variants</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-center bg-white p-6 rounded-xl shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">Dark (Default)</span>
            <VestRealState theme="dark" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">Light</span>
            <VestRealState theme="light" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">Green</span>
            <VestRealState theme="green" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">Pink</span>
            <VestRealState theme="pink" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">Brand</span>
            <VestRealState theme="brand" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">With Colors</span>
            <VestRealState withColors />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">Ghost Brand</span>
            <VestRealState theme="ghost-brand" />
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Side by Side Comparison</h2>
        <div className="flex flex-wrap items-end gap-12">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">VestLogo</span>
            <VestLogo className="w-32 h-32" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">VestRealState (Brand)</span>
            <VestRealState theme="brand" />
          </div>
        </div>
      </section>
    </div>
  );
}
