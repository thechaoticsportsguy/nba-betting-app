'use client';

import { useEffect, useState } from 'react';
import type { LiveGame } from '@/lib/types';
import ScoreboardCard from './ScoreboardCard';
import { CardSkeleton } from './Skeleton';

export default function LiveScoreboard({ initialGames }: { initialGames: LiveGame[] }) {
  const [games, setGames] = useState<LiveGame[]>(initialGames);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/live-games', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setGames(data.games ?? []);
        }
      } catch { /* silent */ }
      setLoading(false);
    };

    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, []);

  if (games.length === 0 && !loading) {
    return <p className="text-sm text-slate-500">No games scheduled today.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Today&apos;s Games</h2>
        <span className="text-xs text-slate-500">{loading ? 'Refreshing...' : 'Auto-refresh 30s'}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.length > 0
          ? games.map((g) => <ScoreboardCard key={g.id} game={g} />)
          : Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );
}
