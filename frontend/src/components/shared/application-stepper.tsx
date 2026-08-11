import { XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import type { ApplicationStatus } from "@/lib/types";

/**
 * Positive path only — real backend statuses, same as the RH view.
 * "rejetee" is a terminal state shown separately, never part of this progression.
 */
const POSITIVE_STEPS: ApplicationStatus[] = [
  "envoyee",
  "en_cours_analyse",
  "preselectionnee",
  "entretien_programme",
  "entretien_realise",
  "acceptee",
];

export function ApplicationStepper({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  if (status === "rejetee") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive",
          className
        )}
      >
        <XCircle className="size-4 shrink-0" />
        <span className="font-medium">{APPLICATION_STATUS_LABELS.rejetee}</span>
      </div>
    );
  }

  const currentIndex = Math.max(0, POSITIVE_STEPS.indexOf(status));

  return (
    <div className={cn("flex items-start", className)}>
      {POSITIVE_STEPS.map((step, i) => {
        const filled = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const isLast = i === POSITIVE_STEPS.length - 1;
        return (
          <div key={step} className={cn("flex items-center", !isLast && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "shrink-0 rounded-full transition-all",
                  isCurrent
                    ? "size-3.5 bg-yas-yellow ring-4 ring-yas-yellow/25"
                    : filled
                      ? "size-3 bg-yas-yellow"
                      : "size-3 bg-slate-200"
                )}
              />
              <span
                className={cn(
                  "hidden text-center text-[10px] font-semibold uppercase tracking-wide sm:block",
                  filled ? "text-yas-midnight" : "text-slate-400"
                )}
              >
                {APPLICATION_STATUS_LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <span
                className={cn(
                  "mx-1.5 mt-1.5 h-0.5 flex-1 rounded-full",
                  i < currentIndex ? "bg-yas-yellow" : "bg-slate-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
