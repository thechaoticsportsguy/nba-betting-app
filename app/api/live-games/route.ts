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
import { withCache } from '@/lib/server/cache';
import { formatET } from '@/lib/server/time';
import { NormalizedLiveGame } from '@/lib/types';

const ESPN_SCOREBOARD = 'https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';

export async function GET() {
  try {
    const games = await withCache('espn-live-games', 20, async () => {
      const res = await fetch(ESPN_SCOREBOARD, { next: { revalidate: 20 } });
      if (!res.ok) throw new Error(`ESPN error: ${res.status}`);
      const data = await res.json();

      return (data.events ?? []).map((event: any): NormalizedLiveGame => {
        const comp = event.competitions?.[0];
        const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
        const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');

        return {
          id: event.id,
          status: event.status?.type?.state ?? 'scheduled',
          shortStatus: event.status?.type?.shortDetail ?? 'Scheduled',
          startTime: event.date,
          startTimeET: formatET(event.date),
          period: comp?.status?.period,
          clock: comp?.status?.displayClock,
          broadcast: comp?.broadcasts?.[0]?.names?.join(', ') ?? 'TBD',
          venue: comp?.venue?.fullName,
          homeTeam: {
            id: home?.team?.id,
            name: home?.team?.displayName,
            abbreviation: home?.team?.abbreviation,
            logo: home?.team?.logo,
            score: Number(home?.score ?? 0)
          },
          awayTeam: {
            id: away?.team?.id,
            name: away?.team?.displayName,
            abbreviation: away?.team?.abbreviation,
            logo: away?.team?.logo,
            score: Number(away?.score ?? 0)
          }
        };
      });
    });

    return NextResponse.json({ games });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
