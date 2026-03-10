import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';
import type { BDLGameStats, BDLPlayer, BDLSeasonAverages } from '@/lib/types';

const TTL = 10 * 60 * 1000; // 10 min

const headers: HeadersInit = {
  Authorization: process.env.BALLDONTLIE_API_KEY ?? '',
};

async function bdlFetch<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.balldontlie.io/v1${path}`, { headers, next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`BDL ${res.status}`);
  return res.json();
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const cacheKey = `bdl-player-${id}`;

  if (!process.env.BALLDONTLIE_API_KEY) {
    return NextResponse.json({ error: 'BALLDONTLIE_API_KEY not set' }, { status: 503 });
  }

  try {
    const cached = getCached<unknown>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [playerRes, averagesRes, gameStatsRes] = await Promise.all([
      bdlFetch<{ data: BDLPlayer }>(`/players/${id}`),
      bdlFetch<{ data: BDLSeasonAverages[] }>(`/season_averages?player_ids[]=${id}`),
      bdlFetch<{ data: BDLGameStats[] }>(`/stats?player_ids[]=${id}&per_page=15&sort=-game.date`),
    ]);

    const payload = {
      player: playerRes.data,
      seasonAverages: averagesRes.data[0] ?? null,
      recentGames: gameStatsRes.data,
    };

    setCache(cacheKey, payload, TTL);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch player data' }, { status: 500 });
  }
}
