import { NextResponse } from 'next/server';
import { normalizeEspnGames } from '@/lib/espn';

const ESPN_SCOREBOARD_URL = 'https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';

export const revalidate = 15;

export async function GET() {
  try {
    const response = await fetch(ESPN_SCOREBOARD_URL, { next: { revalidate: 15 } });
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch live games' }, { status: 502 });
    }

    const payload = await response.json();
    const games = normalizeEspnGames(payload);
    return NextResponse.json({ games });
  } catch {
    return NextResponse.json({ error: 'Unexpected error loading live games' }, { status: 500 });
  }
}
