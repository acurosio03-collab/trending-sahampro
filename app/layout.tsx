import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { Disclaimer } from "@/components/Disclaimer";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: { default: "TRENDING SAHAM PRO — Analisis & Pemantauan Saham Indonesia", template: "%s • TRENDING SAHAM PRO" },
  description: "Platform pemantauan, analisis, dan informasi saham BEI: trending stocks, screener, watchlist, portfolio tracker, dan AI Stock Analyst.",
};
export const viewport: Viewport = { themeColor: "#050912", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen pb-24 lg:pb-0">
        <Nav />
        <main className="fade-in mx-auto max-w-7xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-7xl space-y-3 px-4 pb-10 pt-4">
          <Disclaimer />
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} TRENDING SAHAM PRO</span>
            <Link href="/about" className="hover:text-white">Tentang</Link>
            <Link href="/faq" className="hover:text-white">FAQ</Link>
            <Link href="/privacy" className="hover:text-white">Privasi & Risiko</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
