import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "U19 USA Underwater Hockey - Road to Turkey 2026",
  description: "Follow the U19 USA Men's Underwater Hockey team on their journey to the 2026 CMAS World Championship in Turkey. Live countdown, team training activity, and event information.",
  keywords: ["underwater hockey", "U19", "USA", "CMAS", "World Championship", "Turkey", "2026", "Gebze", "octopush", "youth sports"],
  authors: [{ name: "U19 USA UWH Team" }],
  openGraph: {
    title: "U19 USA Underwater Hockey - Road to Turkey 2026",
    description: "Follow the U19 USA Men's Underwater Hockey team on their journey to the 2026 CMAS World Championship in Turkey",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "U19 USA Underwater Hockey - Road to Turkey 2026",
    description: "Follow the U19 USA Men's Underwater Hockey team on their journey to the 2026 CMAS World Championship in Turkey",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
