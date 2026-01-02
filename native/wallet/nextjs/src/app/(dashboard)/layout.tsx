import { BottomNav } from "wallet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-muted/5">
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
