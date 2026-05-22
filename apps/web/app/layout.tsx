import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CouponEm',
  description: 'Manage your gift card coupons',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          <header className="bg-slate-900 text-white px-6 py-0 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto flex items-center justify-between h-14">
              <a href="/" className="text-lg font-bold tracking-tight flex items-center gap-2">
                <span className="bg-primary rounded-md px-2 py-0.5 text-white text-sm">C</span>
                CouponEm
              </a>
              <nav className="flex items-center gap-6 text-sm">
                <a href="/" className="text-slate-300 hover:text-white transition-colors">My Coupons</a>
                <a href="/history" className="text-slate-300 hover:text-white transition-colors">History</a>
              </nav>
            </div>
          </header>
          <main className="container mx-auto px-6 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
