'use client';

import { useEffect, useState } from 'react';
import { EnrichedGame } from '@/lib/types';

interface UseLiveGamesResult {
  games: EnrichedGame[];
  isLoading: boolean;
  error: string | null;
}

export const useLiveGames = (initialGames: EnrichedGame[]): UseLiveGamesResult => {
  const [games, setGames] = useState<EnrichedGame[]>(initialGames);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const refreshGames = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/games', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Unable to refresh games');
        }
        const payload = (await response.json()) as { games: EnrichedGame[] };
        setGames(payload.games);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    const intervalId = setInterval(refreshGames, 10_000);
    return () => clearInterval(intervalId);
  }, []);

  return { games, isLoading, error };
};
