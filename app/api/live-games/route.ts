import { NextResponse } from 'next/server';
import { LiveGame } from '@/lib/types';

const ESPN_SCOREBOARD_URL = 'https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';

export const revalidate = 15;

export async function GET() {
  try {
    const response = await fetch(ESPN_SCOREBOARD_URL, { next: { revalidate: 15 } });
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch live games' }, { status: 502 });
    }

    const payload = await response.json();
    const games: LiveGame[] = (payload.events ?? []).map((event: any) => {
      const competition = event.competitions?.[0];
      const competitors = competition?.competitors ?? [];
      const home = competitors.find((c: any) => c.homeAway === 'home');
      const away = competitors.find((c: any) => c.homeAway === 'away');

      return {
        id: String(event.id),
        status: competition?.status?.type?.shortDetail ?? competition?.status?.type?.description ?? 'Scheduled',
        state: competition?.status?.type?.state ?? 'pre',
        period: Number(competition?.status?.period ?? 0),
        clock: competition?.status?.displayClock ?? '',
        homeTeam: {
          id: String(home?.team?.id ?? ''),
          name: home?.team?.displayName ?? 'Home',
          abbreviation: home?.team?.abbreviation ?? 'HOME',
          logo: home?.team?.logo ?? '',
          score: Number(home?.score ?? 0)
        },
        awayTeam: {
          id: String(away?.team?.id ?? ''),
          name: away?.team?.displayName ?? 'Away',
          abbreviation: away?.team?.abbreviation ?? 'AWAY',
          logo: away?.team?.logo ?? '',
          score: Number(away?.score ?? 0)
        }
      };
    });

    return NextResponse.json({ games });
  } catch {
    return NextResponse.json({ error: 'Unexpected error loading live games' }, { status: 500 });
  }
}
