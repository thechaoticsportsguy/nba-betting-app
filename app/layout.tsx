import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'NBA Betting Hub',
  description: 'Live NBA games, box scores, stats, and betting lines'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-slate-100 antialiased">{children}</body>
    </html>
  );
}
