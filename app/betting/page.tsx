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
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Betting Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Live games · Odds · Player props · Full roster</p>
        </div>
        <BettingDashboard odds={odds?.games ?? []} propsData={{ pp, apisports }} />
      </div>
    </main>
  );
}
