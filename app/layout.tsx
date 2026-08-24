import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "CogniTrace — Catch the AI's mistake before it catches you",
  description: "Diagnostic active-verification tutor: locate and explain planted logical errors to prove mastery.",
};

import { SessionProvider } from "@/lib/state/SessionContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F0F0F0] text-[#121212]">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
