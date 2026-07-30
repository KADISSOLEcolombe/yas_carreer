import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import ChatbotWidget from "@/components/ChatbotWidget";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { FavorisProvider } from "../context/FavorisContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YAS Togo - Trouvez votre stage ou emploi",
  description: "Plateforme de recrutement pour les talents au Togo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <FavorisProvider>
            {children}
            <Toaster richColors position="top-right" />
            <ChatbotWidget />
          </FavorisProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
