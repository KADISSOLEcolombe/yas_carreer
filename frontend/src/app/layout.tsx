import type { Metadata } from "next";
import { Geist, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/shared/site-header";
import { ChatbotWidget } from "@/components/shared/chatbot-widget";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "YasCareer — Recrutement Yas Togo",
  description:
    "YasCareer, la plateforme de recrutement Yas Togo : offres de stage et d'emploi, suivi de candidature et entretiens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
          </div>
          <ChatbotWidget />
        </Providers>
      </body>
    </html>
  );
}
