import './globals.css';
import Navbar from '../components/Navbar';
import { Figtree } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from './providers';

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400'],
});

export const metadata = {
  title: 'VeriCredit AI | CCTS Compliant Carbon Market',
  description: 'AI-verified, blockchain-backed carbon credits aligned with India CCTS 2026. Powered by DeepForest ML, Google Earth Engine, and Polygon.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", figtree.variable)} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={cn("min-h-screen flex flex-col antialiased", figtree.className)}>
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 print:hidden">
            <p>VeriCredit AI © {new Date().getFullYear()} · CCTS Compliant · Polygon Amoy Testnet</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
