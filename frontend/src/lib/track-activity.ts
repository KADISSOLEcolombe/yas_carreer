"use client";

import { activityLogsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

/** Trace un clic / panneau UI côté RH (best-effort, ne bloque jamais l’UI). */
export function trackRhAction(
  action: string,
  summary: string,
  extra?: {
    category?: string;
    resourceType?: string;
    resourceId?: number;
    metadata?: Record<string, unknown>;
  }
) {
  const role = useAuthStore.getState().user?.role;
  if (role !== "rh" && role !== "admin") return;

  void activityLogsApi.track({
    action,
    summary,
    category: extra?.category || "ui",
    resourceType: extra?.resourceType,
    resourceId: extra?.resourceId,
    metadata: extra?.metadata,
  });
}
