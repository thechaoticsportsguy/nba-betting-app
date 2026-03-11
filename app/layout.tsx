import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'NBA Live Hub',
  description: 'Real-time NBA games, players, and headlines'
  title: 'NBA Betting Hub',
  description: 'Live NBA games, box scores, stats, and betting lines'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-slate-100 antialiased">{children}</body>
    </html>
  );
}
