'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type HealthResponse = {
  apiStatus: {
    espn: { ok: boolean; status: number };
    balldontlie: { ok: boolean; status: number };
    oddsConfigured: boolean;
  };
  checkedAt: string;
};

const endpointLinks = [
  { href: '/api/live-games', label: 'Live games API' },
  { href: '/api/odds', label: 'Odds API proxy' },
  { href: '/api/player-analysis', label: 'Player analysis API' },
  { href: '/api/teams', label: 'Teams API' }
];

export default function HomeControlCenter() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Control Center</h2>
        <button onClick={loadHealth} className="rounded border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-50">
          Recheck APIs
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {endpointLinks.map((item) => (
          <a key={item.href} href={item.href} target="_blank" className="rounded-lg border border-slate-200 p-3 text-sm hover:border-blue-300 hover:bg-blue-50">
            Open {item.label}
          </a>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 p-3 text-sm">
        {loading ? (
          <p>Checking API health...</p>
        ) : health ? (
          <ul className="space-y-1">
            <li>ESPN feed: {health.apiStatus.espn.ok ? '✅ connected' : `❌ error (${health.apiStatus.espn.status || 'network'})`}</li>
            <li>BallDontLie feed: {health.apiStatus.balldontlie.ok ? '✅ connected' : `❌ error (${health.apiStatus.balldontlie.status || 'network'})`}</li>
            <li>Odds API key: {health.apiStatus.oddsConfigured ? '✅ configured' : '⚠️ missing (dashboard uses fallback views)'}</li>
          </ul>
        ) : (
          <p className="text-rose-600">Could not load health status.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/betting" className="rounded bg-slate-900 px-3 py-2 text-white">Open Betting</Link>
        <Link href="/teams" className="rounded border border-slate-300 px-3 py-2">Browse Teams</Link>
      </div>
    </section>
  );
}
