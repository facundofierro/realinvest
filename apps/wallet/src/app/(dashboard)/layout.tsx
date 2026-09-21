import { DashboardLayoutClient } from "@/components/dashboard-layout-client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <DashboardLayoutClient>
      {children}
    </DashboardLayoutClient>
  );
}
