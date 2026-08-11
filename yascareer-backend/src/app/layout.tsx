import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YasCareer API",
  description: "API de la plateforme de recrutement Yas Togo.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
