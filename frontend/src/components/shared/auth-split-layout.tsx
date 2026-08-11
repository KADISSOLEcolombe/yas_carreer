import { BrandLogo } from "@/components/shared/brand-logo";
import { ImageCarousel } from "@/components/shared/image-carousel";

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 lg:block">
        <ImageCarousel className="h-full" />
        <div className="absolute left-8 top-8 z-10">
          <BrandLogo href="/" size="md" variant="light" />
        </div>
        <div className="absolute inset-x-8 bottom-16 z-10">
          <p className="font-heading text-2xl font-semibold leading-snug text-white">
            Rejoignez l&apos;aventure Yas Togo
          </p>
          <p className="mt-1 text-sm text-white/75">
            « Let&apos;s grow together » — carrières, stages et opportunités
            partout au Togo.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-[#F5F7FA] px-4 py-10 sm:px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandLogo href="/" size="md" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
