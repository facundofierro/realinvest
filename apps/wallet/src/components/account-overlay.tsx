"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { useAppSession } from "@/lib/session";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  ResponsiveOverlay,
  ResponsiveOverlayDescription,
  ResponsiveOverlayFooter,
  ResponsiveOverlayHeader,
  ResponsiveOverlayTitle,
} from "@/components/responsive-overlay";

const KYC_ACTIONS = {
  none: "Completar verificación",
  pending: "Ver estado de verificación",
  rejected: "Reintentar verificación",
} as const;

export function AccountOverlay({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useCurrentUser();
  const { signOut } = useAppSession();
  const kycStatus = user?.kycStatus ?? "none";
  const kycAction =
    KYC_ACTIONS[kycStatus as keyof typeof KYC_ACTIONS] ?? null;

  return (
    <ResponsiveOverlay open={open} onOpenChange={onOpenChange} size="sm">
      <ResponsiveOverlayHeader>
        <div className="mb-2 flex items-center gap-3">
          {user?.image ? (
            <img alt="" className="h-10 w-10 rounded-full" src={user.image} />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              {user?.name?.[0] ?? "U"}
            </span>
          )}
          <div className="text-left">
            <ResponsiveOverlayTitle>{user?.name ?? "Cuenta"}</ResponsiveOverlayTitle>
            <ResponsiveOverlayDescription>{user?.email}</ResponsiveOverlayDescription>
          </div>
        </div>
        <ResponsiveOverlayDescription>Estado KYC: {kycStatus}</ResponsiveOverlayDescription>
        {kycAction ? (
          <Button asChild variant="outline">
            <Link href="/kyc" onClick={() => onOpenChange(false)}>
              {kycAction}
            </Link>
          </Button>
        ) : (
          <ResponsiveOverlayDescription>Verificación aprobada.</ResponsiveOverlayDescription>
        )}
      </ResponsiveOverlayHeader>
      <ResponsiveOverlayFooter>
        <Button onClick={() => void signOut()}>Cerrar sesión</Button>
      </ResponsiveOverlayFooter>
    </ResponsiveOverlay>
  );
}
