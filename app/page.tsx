export const dynamic = 'force-dynamic';
import { headers } from 'next/headers';
import Navbar from '@/components/Navbar';
import LiveScoreboard from '@/components/LiveScoreboard';
import OddsTicker from '@/components/OddsTicker';

async function getLiveGames(baseUrl: string) {
  const res = await fetch(`${baseUrl}/api/live-games`, { next: { revalidate: 30 } });
  if (!res.ok) return { games: [] };
  return res.json();
}

async function getOdds(baseUrl: string) {
  const res = await fetch(`${baseUrl}/api/odds`, { next: { revalidate: 30 } });
  if (!res.ok) return { odds: [] };
  return res.json();
}

export default async function HomePage() {
  const host = headers().get('host') ?? 'localhost:3000';
  const baseUrl = /^(localhost|127\.0\.0\.1)/.test(host) ? `http://${host}` : `https://${host}`;
  const [{ games }, { odds }] = await Promise.all([getLiveGames(baseUrl), getOdds(baseUrl)]);

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <h1 className="text-2xl font-bold">Live NBA Scoreboard</h1>
        <OddsTicker odds={odds} />
        <LiveScoreboard games={games} />
      </div>
    </main>
  );
}
