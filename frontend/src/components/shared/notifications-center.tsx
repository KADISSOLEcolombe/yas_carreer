"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  Briefcase,
  CalendarClock,
  CheckCheck,
  FileText,
  Mail,
  Sparkles,
  Trophy,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError, notificationsApi } from "@/lib/api";
import {
  NOTIFICATION_TYPE_LABELS,
  notificationHref,
} from "@/lib/constants";
import { useAuthStore } from "@/lib/auth-store";
import { SoftCard, SoftPageHeader } from "@/components/shared/soft-ui";
import { cn } from "@/lib/utils";

function typeIcon(type: string) {
  switch (type) {
    case "new_application":
    case "guest_application":
      return FileText;
    case "interview":
      return CalendarClock;
    case "rh_email":
      return Mail;
    case "offer_published":
      return Briefcase;
    case "ai_analysis_ready":
      return Sparkles;
    case "ai_ranking_ready":
      return Trophy;
    case "account_activated":
      return UserCheck;
    default:
      return Bell;
  }
}

function formatFull(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function NotificationsCenter({
  title = "Notifications",
  description = "Suivez les événements importants de YasCareer.",
}: {
  title?: string;
  description?: string;
}) {
  const queryClient = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.me(),
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Toutes les notifications sont lues");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Action impossible"
      );
    },
  });

  return (
    <div>
      <SoftPageHeader
        title={title}
        description={description}
        action={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-xl"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <CheckCheck className="size-4" />
              Tout marquer comme lu
            </Button>
          ) : undefined
        }
      />

      {unreadCount > 0 && (
        <p className="mb-4 text-sm text-slate-500">
          <span className="font-semibold text-yas-midnight">{unreadCount}</span>{" "}
          non lue{unreadCount > 1 ? "s" : ""}
        </p>
      )}

      <SoftCard className="!p-0 overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Bell className="mx-auto size-10 text-slate-300" />
            <p className="mt-3 font-heading text-lg font-semibold text-yas-midnight">
              Aucune notification
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Les nouvelles candidatures, entretiens et analyses IA
              apparaîtront ici.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((n) => {
              const Icon = typeIcon(n.type);
              const href = notificationHref(n.type, role);
              return (
                <li key={n.id}>
                  <Link
                    href={href}
                    onClick={() => {
                      if (!n.readAt) markReadMutation.mutate(n.id);
                    }}
                    className={cn(
                      "flex items-start gap-3 px-4 py-4 transition hover:bg-slate-50 sm:px-5",
                      !n.readAt && "bg-yas-sky/[0.04]"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
                        !n.readAt
                          ? "bg-yas-midnight text-white"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-yas-sky">
                          {NOTIFICATION_TYPE_LABELS[n.type] || n.type}
                        </span>
                        {!n.readAt && (
                          <span className="rounded-full bg-yas-yellow px-2 py-0.5 text-[10px] font-bold text-yas-midnight">
                            Nouveau
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-slate-700">
                        {n.content}
                      </span>
                      <span className="mt-1.5 block text-xs text-slate-400">
                        {formatFull(n.createdAt)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </SoftCard>
    </div>
  );
}
