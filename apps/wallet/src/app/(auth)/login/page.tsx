import LoginPage from "@/components/pages/login-page";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const redirectTo =
    callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/";

  if ((await auth())?.user?.id) {
    redirect(redirectTo);
  }

  return <LoginPage callbackUrl={redirectTo} error={error} />;
}
