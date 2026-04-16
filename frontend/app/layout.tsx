import './globals.css';
import Navbar from '../components/Navbar';
import ClientProviders from './ClientProviders';

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <ClientProviders>
          <Navbar />
          <main className="flex-grow p-4 md:p-8">
            {children}
          </main>
          <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 print:hidden">
            <p>VeriCredit AI © {new Date().getFullYear()} · CCTS Compliant · Polygon Amoy Testnet</p>
          </footer>
        </ClientProviders>
      </body>
    </html>
  );
}
