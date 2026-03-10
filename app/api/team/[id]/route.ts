import { NextResponse } from 'next/server';
import { withCache } from '@/lib/server/cache';

const BASE = 'https://api.balldontlie.io/v2';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const key = process.env.BALDONTLIE_API_KEY;
  if (!key) return NextResponse.json({ error: 'Missing BALDONTLIE_API_KEY' }, { status: 500 });

  try {
    const teamData = await withCache(`team-${params.id}`, 900, async () => {
      const [team, games, roster] = await Promise.all([
        fetch(`${BASE}/teams/${params.id}`, { headers: { Authorization: key }, next: { revalidate: 3600 } }).then((r) => r.json()),
        fetch(`${BASE}/games?team_ids[]=${params.id}&per_page=10`, { headers: { Authorization: key }, next: { revalidate: 900 } }).then((r) => r.json()),
        fetch(`${BASE}/players?team_ids[]=${params.id}&per_page=100`, { headers: { Authorization: key }, next: { revalidate: 3600 } }).then((r) => r.json())
      ]);

      return { team: team.data, recentGames: games.data ?? [], roster: roster.data ?? [] };
    });

    return NextResponse.json(teamData);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
