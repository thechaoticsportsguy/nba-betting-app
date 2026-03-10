'use client';

import { useLiveGames } from '@/hooks/useLiveGames';
import { EnrichedGame } from '@/lib/types';
import LiveGameCard from '@/components/LiveGameCard';

export default function LiveGamesSection({ initialGames }: { initialGames: EnrichedGame[] }) {
  const { games, isLoading, error } = useLiveGames(initialGames);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Live Games</h2>
        <p className="text-xs text-slate-400">Auto-refresh every 10 seconds {isLoading ? '• Updating...' : ''}</p>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <LiveGameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
