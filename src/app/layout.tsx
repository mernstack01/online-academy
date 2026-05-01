import type { Metadata } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const displayFont = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const bodyFont = Sora({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Grafik Ta'lim | O'rgan & Rivojlan",
  description: "Grafik dizayn, 3D, UI/UX va AI bo'yicha onlayn ta'lim platformasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    '';

  return (
    <html
      lang="uz"
      data-google-client-id={googleClientId}
      className={cn("font-sans", bodyFont.variable, displayFont.variable)}
      suppressHydrationWarning
    >
      <body className={`${bodyFont.className} antialiased`} suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            <div className="bg-gradient-mesh" />
            <Navbar />
            <main className="min-h-screen pt-20 px-4 md:px-8 max-w-7xl mx-auto">
              {children}
            </main>
            <Footer />
            <Toaster richColors />
            <ChatBot />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
