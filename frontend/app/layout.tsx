import './globals.css';
import Navbar from '../components/Navbar';
import { Providers } from './providers';

export const metadata = {
  title: 'VeriCredit AI | CCTS Compliant Carbon Market',
  description: 'AI-verified, blockchain-backed carbon credits aligned with India CCTS 2026.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-grow p-4 md:p-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
