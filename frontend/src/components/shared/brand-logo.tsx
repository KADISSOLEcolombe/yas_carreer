import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string | null;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
  priority?: boolean;
};

const SIZE = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
  xl: "size-16",
  hero: "size-20 sm:size-28 md:size-36",
} as const;

export function BrandLogo({
  href = "/",
  size = "md",
  showWordmark = true,
  wordmarkClassName,
  className,
  priority,
}: BrandLogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
          SIZE[size]
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo_yas.svg"
          alt="Yas"
          className="h-full w-full object-contain"
          decoding="async"
          {...(priority ? { fetchPriority: "high" as const } : {})}
        />
      </span>
      {showWordmark && (
        <span className={cn("min-w-0 leading-tight", wordmarkClassName)}>
          <span className="block truncate font-heading text-base font-bold tracking-tight text-yas-midnight sm:text-lg">
            YasCareer
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-yas-sky">
            Yas Togo
          </span>
        </span>
      )}
    </span>
  );

  if (href === null) return content;
  return (
    <Link href={href} className="inline-flex min-w-0 shrink-0 items-center">
      {content}
    </Link>
  );
}
