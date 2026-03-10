'use client';

import { useEffect, useState } from 'react';
import GameCard from '@/components/GameCard';
import GameDrawer from '@/components/GameDrawer';
import { ESPNGame } from '@/lib/types';

export default function HomePage() {
  const [games, setGames] = useState<ESPNGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<ESPNGame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const res = await fetch('/api/live-games', { cache: 'no-store' });
        const payload = await res.json();
        setGames(payload.games ?? []);
        setError(null);
      } catch {
        setError('Unable to load live games right now.');
      } finally {
        setLoading(false);
      }
    };

    loadGames();
    const interval = setInterval(loadGames, 15_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-1 text-3xl font-bold">NBA Unified Live Dashboard</h1>
        <p className="mb-6 text-sm text-slate-400">Live games, box scores, player stats, betting odds — synced in one flow.</p>

        {error ? <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

        {loading ? (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-44 animate-pulse rounded-2xl bg-slate-800" />
            ))}
          </section>
        ) : games.length === 0 ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-slate-300">No live or upcoming NBA games currently available.</p>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.id} game={game} onClick={setSelectedGame} />
            ))}
          </section>
        )}
      </div>

      <GameDrawer game={selectedGame} onClose={() => setSelectedGame(null)} />
    </main>
  );
}
