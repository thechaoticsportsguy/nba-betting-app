'use client';

import { useEffect, useState } from 'react';
import GameCard from '@/components/GameCard';
import GamePanel from '@/components/GamePanel';
import { LiveGame } from '@/lib/types';

export default function HomePage() {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<LiveGame | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const res = await fetch('/api/live-games', { cache: 'no-store' });
        const payload = await res.json();
        setGames(payload.games ?? []);
        setError(null);
      } catch {
        setError('Unable to load live games right now.');
      }
    };

    loadGames();
    const interval = setInterval(loadGames, 15_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-1 text-3xl font-bold text-slate-900">NBA Live Dashboard</h1>
        <p className="mb-6 text-sm text-slate-600">Live games, box scores, player stats, and betting odds (auto-refresh).</p>

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.id} game={game} onClick={setSelectedGame} />
          ))}
        </section>
      </div>

      <GamePanel game={selectedGame} onClose={() => setSelectedGame(null)} />
    </main>
  );
}
