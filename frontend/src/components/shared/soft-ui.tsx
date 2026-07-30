import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SoftCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SoftKpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "midnight",
  trend,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "midnight" | "sky" | "yellow";
  trend?: { value: string; up?: boolean };
}) {
  const tones = {
    midnight: "bg-yas-midnight/8 text-yas-midnight",
    sky: "bg-yas-sky/15 text-yas-sky",
    yellow: "bg-yas-yellow/40 text-yas-midnight",
  };

  return (
    <SoftCard className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 font-heading text-3xl font-bold tabular-nums text-slate-900">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            tones[tone]
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-400">{hint}</p>
        {trend && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              trend.up
                ? "bg-yas-sky/15 text-yas-midnight"
                : "bg-amber-50 text-amber-700"
            )}
          >
            {trend.up ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
    </SoftCard>
  );
}

export function SoftPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="font-heading text-xl font-bold text-yas-midnight sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          {action}
        </div>
      )}
    </div>
  );
}

export function SoftTabs({
  items,
  value,
  onChange,
}: {
  items: { value: string; label: string; count?: number }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
      {items.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
              active
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-slate-800"
            )}
          >
            {item.label}
            {typeof item.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px] tabular-nums",
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function SoftSearch({
  value,
  onChange,
  placeholder = "Rechercher…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-xs">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
        />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-yas-sky focus:ring-2 focus:ring-yas-sky/20"
      />
    </div>
  );
}

export function SoftToolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}

export function SoftStatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
}) {
  const map = {
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-rose-50 text-rose-700",
    info: "bg-yas-sky/15 text-yas-midnight",
    neutral: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        map[tone]
      )}
    >
      {children}
    </span>
  );
}

/** Simple multi-series sparkline for Soft UI dashboards (no chart lib). */
export function SoftSparkline({
  series,
}: {
  series: { color: string; values: number[] }[];
}) {
  const w = 520;
  const h = 160;
  const pad = 8;
  const max = Math.max(1, ...series.flatMap((s) => s.values));

  function path(values: number[]) {
    if (values.length < 2) return "";
    return values
      .map((v, i) => {
        const x = pad + (i / (values.length - 1)) * (w - pad * 2);
        const y = h - pad - (v / max) * (h - pad * 2);
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full">
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={pad}
          x2={w - pad}
          y1={pad + t * (h - pad * 2)}
          y2={pad + t * (h - pad * 2)}
          stroke="#E2E8F0"
          strokeDasharray="4 6"
        />
      ))}
      {series.map((s, idx) => (
        <path
          key={idx}
          d={path(s.values)}
          fill="none"
          stroke={s.color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

export function scoreTone(score: number | null | undefined) {
  if (score == null) return "text-slate-400";
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-rose-600";
}

export function statusTone(
  status: string
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (status) {
    case "acceptee":
    case "publiee":
    case "planifie":
      return "success";
    case "en_cours_analyse":
    case "entretien_programme":
    case "brouillon":
      return "warning";
    case "rejetee":
    case "fermee":
    case "annule":
      return "danger";
    case "envoyee":
      return "info";
    default:
      return "neutral";
  }
}
