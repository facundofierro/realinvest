import LoginPage from "@/components/pages/login-page";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  if ((await auth())?.user?.id) {
    redirect("/");
  }

  const { callbackUrl, error } = await searchParams;
  const redirectTo = callbackUrl?.startsWith("/") ? callbackUrl : "/";

  return <LoginPage callbackUrl={redirectTo} error={error} />;
}
