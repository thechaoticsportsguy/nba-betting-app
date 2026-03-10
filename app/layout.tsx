import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NBA Live Hub',
  description: 'Real-time NBA games, players, and headlines'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
