import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NBA Betting Hub',
  description: 'Live NBA games, box scores, stats, and betting lines'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
