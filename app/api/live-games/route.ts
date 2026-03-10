import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';
import type { ESPNEvent, LiveGame } from '@/lib/types';

const CACHE_KEY = 'espn-live-games';
const TTL = 30_000; // 30 seconds

function normalize(event: ESPNEvent): LiveGame {
  const comp = event.competitions[0];
  const away = comp.competitors.find((c) => c.homeAway === 'away')!;
  const home = comp.competitors.find((c) => c.homeAway === 'home')!;
  const broadcast = comp.broadcasts?.[0]?.names?.[0] ?? '';

  return {
    id: event.id,
    date: event.date,
    state: event.status.type.state,
    shortDetail: event.status.type.shortDetail,
    period: event.status.period,
    clock: event.status.displayClock,
    awayTeam: {
      id: away.team.id,
      abbr: away.team.abbreviation,
      name: away.team.displayName,
      logo: away.team.logo,
      score: parseInt(away.score, 10) || 0,
      record: away.records?.[0]?.summary,
    },
    homeTeam: {
      id: home.team.id,
      abbr: home.team.abbreviation,
      name: home.team.displayName,
      logo: home.team.logo,
      score: parseInt(home.score, 10) || 0,
      record: home.records?.[0]?.summary,
    },
    broadcast,
  };
}

export async function GET() {
  try {
    const cached = getCached<LiveGame[]>(CACHE_KEY);
    if (cached) return NextResponse.json({ games: cached });

    const res = await fetch(
      'https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
      { next: { revalidate: 30 } },
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'ESPN API error' }, { status: 502 });
    }

    const json = await res.json();
    const events: ESPNEvent[] = json.events ?? [];
    const games = events.map(normalize);

    setCache(CACHE_KEY, games, TTL);
    return NextResponse.json({ games });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch live games' }, { status: 500 });
  }
}
