"use client";

import { usePathname } from "next/navigation";

/** Affiche les enfants uniquement sur les pages publiques / auth (pas RH, admin, candidat). */
export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (
    pathname.startsWith("/rh") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/candidat")
  ) {
    return null;
  }
  return <>{children}</>;
}
