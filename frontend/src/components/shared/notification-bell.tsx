"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  Briefcase,
  CheckCheck,
  FileText,
  Mail,
  Sparkles,
  Trophy,
  UserCheck,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApiError, notificationsApi } from "@/lib/api";
import {
  NOTIFICATION_TYPE_LABELS,
  notificationHref,
} from "@/lib/constants";
import { useAuthStore } from "@/lib/auth-store";
import type { Notification } from "@/lib/types";
import { cn } from "@/lib/utils";

function relativeTime(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "À l’instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days} j`;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

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

export function NotificationBell({
  centerHref,
  className,
  size = "md",
}: {
  centerHref: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const queryClient = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.me(),
    refetchInterval: 30_000,
  });

  const { data: unread } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30_000,
  });

  const unreadCount = unread?.count ?? 0;
  const preview = notifications.slice(0, 8);

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
      toast.success("Tout marqué comme lu");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Action impossible"
      );
    },
  });

  async function handleOpenItem(n: Notification) {
    if (!n.readAt) {
      try {
        await markReadMutation.mutateAsync(n.id);
      } catch {
        // ignore
      }
    }
  }

  const btnSize = size === "sm" ? "size-9" : "size-10";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-yas-midnight",
            btnSize,
            className
          )}
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-yas-yellow px-1 text-[10px] font-bold text-yas-midnight ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <DropdownMenuLabel className="p-0 font-heading text-sm text-yas-midnight">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-yas-sky"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <CheckCheck className="size-3.5" />
              Tout lire
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[360px] overflow-y-auto py-1">
          {preview.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              Aucune notification pour le moment.
            </p>
          ) : (
            preview.map((n) => {
              const Icon = typeIcon(n.type);
              const href = notificationHref(n.type, role);
              return (
                <DropdownMenuItem key={n.id} asChild className="p-0">
                  <Link
                    href={href}
                    onClick={() => handleOpenItem(n)}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 px-3 py-2.5",
                      !n.readAt && "bg-yas-sky/5"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                        !n.readAt
                          ? "bg-yas-midnight text-white"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-yas-sky">
                          {NOTIFICATION_TYPE_LABELS[n.type] || n.type}
                        </span>
                        {!n.readAt && (
                          <span className="size-1.5 rounded-full bg-yas-yellow" />
                        )}
                      </span>
                      <span className="mt-0.5 block text-sm leading-snug text-slate-700 line-clamp-2">
                        {n.content}
                      </span>
                      <span className="mt-1 block text-[11px] text-slate-400">
                        {relativeTime(n.createdAt)}
                      </span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="p-2">
          <Button
            asChild
            variant="outline"
            className="h-9 w-full rounded-xl text-sm"
          >
            <Link href={centerHref}>Voir toutes les notifications</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
