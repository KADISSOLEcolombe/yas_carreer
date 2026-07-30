import { BrandLogo } from "@/components/shared/brand-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-muted/40 px-4 py-8 sm:min-h-[calc(100vh-4rem)] sm:py-12">
      <div className="mb-6 sm:mb-8">
        <BrandLogo href="/" size="md" />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
