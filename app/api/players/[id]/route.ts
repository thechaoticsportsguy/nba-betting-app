import { NextResponse } from 'next/server';
import { withCache } from '@/lib/server/cache';

const BASE = 'https://api.balldontlie.io/v2';

async function callBdl(path: string, key: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: key },
    next: { revalidate: 1800 }
  });
  if (!res.ok) throw new Error(`BallDontLie API error ${res.status}`);
  return res.json();
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const key = process.env.BALDONTLIE_API_KEY;
  if (!key) return NextResponse.json({ error: 'Missing BALDONTLIE_API_KEY' }, { status: 500 });

  try {
    const data = await withCache(`player-v2-${params.id}`, 600, async () => {
      const [player, seasonAverages, gameLogs] = await Promise.all([
        callBdl(`/players/${params.id}`, key),
        callBdl(`/season_averages?player_ids[]=${params.id}&season=${new Date().getFullYear() - 1}`, key),
        callBdl(`/stats?player_ids[]=${params.id}&per_page=15`, key)
      ]);

      return {
        player: player.data,
        seasonAverages: seasonAverages.data?.[0] ?? null,
        gameLogs: gameLogs.data ?? []
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
