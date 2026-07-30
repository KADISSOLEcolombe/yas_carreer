"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import type { UserRole } from "@/lib/types";
import { ROLE_DASHBOARD_PATH } from "@/lib/constants";

export function RouteGuard({
  allow,
  children,
}: {
  allow: UserRole[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.mustChangePassword && pathname !== "/changer-mot-de-passe") {
      router.replace("/changer-mot-de-passe");
      return;
    }
    if (!allow.includes(user.role)) {
      router.replace(ROLE_DASHBOARD_PATH[user.role]);
    }
  }, [hydrated, user, allow, router, pathname]);

  if (
    !hydrated ||
    !user ||
    (user.mustChangePassword && pathname !== "/changer-mot-de-passe") ||
    !allow.includes(user.role)
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-yas-sky" />
      </div>
    );
  }

  return <>{children}</>;
}
