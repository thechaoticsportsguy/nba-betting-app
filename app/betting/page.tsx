export const dynamic = 'force-dynamic';
import { headers } from 'next/headers';
import Navbar from '@/components/Navbar';
import BettingDashboard from '@/components/BettingDashboard';

async function getJson(baseUrl: string, path: string) {
  const res = await fetch(`${baseUrl}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function BettingPage() {
  const host = headers().get('host') ?? 'localhost:3000';
  const baseUrl = /^(localhost|127\.0\.0\.1)/.test(host) ? `http://${host}` : `https://${host}`;
  const [odds, pp, apisports] = await Promise.all([
    getJson(baseUrl, '/api/odds'),
    getJson(baseUrl, '/api/pp-bets'),
    getJson(baseUrl, '/api/apisports-odds')
  ]);

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6">
        <h1 className="text-2xl font-bold">Betting Dashboard</h1>
        <BettingDashboard odds={odds?.games ?? []} propsData={{ pp, apisports }} />
      </div>
    </main>
  );
}
