import {
  VestLogo,
  type VestLogoProps,
} from "@repo/ui/components/brand/vest-logo";
import { VestRealState } from "@repo/ui/components/brand/vest-real-state";

export default function Home() {
  const vestLogoVariants: Array<{
    title: string;
    props: Pick<
      VestLogoProps,
      "showSubtitle" | "forceWhite"
    >;
    previewClassName?: string;
  }> = [
    {
      title: "No background",
      props: { showSubtitle: true },
      previewClassName: "bg-white",
    },
    {
      title: "Mark only",
      props: {
        showSubtitle: false,
      },
      previewClassName: "bg-white",
    },
    {
      title: "No background (white)",
      props: {
        forceWhite: true,
      },
      previewClassName: "bg-black",
    },
    {
      title: "Mark only (white)",
      props: {
        showSubtitle: false,
        forceWhite: true,
      },
      previewClassName: "bg-black",
    },
  ];

  const vestRealStateThemes = [
    "dark",
    "light",
    "brand",
    "ghost-dark",
    "ghost-brand",
  ] as const;

  return (
    <div className="min-h-screen font-sans bg-zinc-50 text-zinc-900">
      <main className="px-6 py-12 mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Brand logo gallery
          </h1>
          <p className="text-zinc-600">
            All logo variants exported
            from @repo/ui.
          </p>
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">
            VestLogo
          </h2>
          <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
            {vestLogoVariants.map(
              ({
                title,
                props,
                previewClassName,
              }) => (
                <div
                  key={title}
                  className="bg-white rounded-2xl border shadow-sm border-zinc-200"
                >
                  <div
                    className={[
                      "flex items-center justify-center rounded-t-2xl p-6",
                      previewClassName ??
                        "bg-white",
                    ].join(" ")}
                  >
                    <VestLogo
                      {...props}
                    />
                  </div>
                  <div className="px-5 py-4">
                    <div className="text-sm font-medium">
                      {title}
                    </div>
                    <pre className="overflow-auto px-4 py-3 mt-2 text-xs rounded-xl bg-zinc-950 text-zinc-50">
                      {JSON.stringify(
                        props,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight">
            VestRealState
          </h2>
          <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
            {vestRealStateThemes.map(
              (theme) => (
                <div
                  key={theme}
                  className="p-5 bg-white rounded-2xl border shadow-sm border-zinc-200"
                >
                  <div className="text-sm font-medium">
                    theme: {theme}
                  </div>
                  <div className="mt-3">
                    <VestRealState
                      theme={theme}
                    />
                  </div>
                </div>
              )
            )}
            <div className="p-5 bg-white rounded-2xl border shadow-sm border-zinc-200">
              <div className="text-sm font-medium">
                Loader (wallet splash)
              </div>
              <div className="overflow-hidden mt-3 bg-black rounded-xl">
                <div className="flex justify-center items-center h-40">
                  <div className="animate-pulse">
                    <VestRealState theme="dark" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
