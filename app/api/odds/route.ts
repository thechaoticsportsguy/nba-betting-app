import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';
import type { NormalizedOddsLine, OddsEvent } from '@/lib/types';

const CACHE_KEY = 'odds-api';
const TTL = 5 * 60 * 1000; // 5 min – preserve free-tier quota

function normalize(events: OddsEvent[]): NormalizedOddsLine[] {
  const lines: NormalizedOddsLine[] = [];
  for (const ev of events) {
    for (const bk of ev.bookmakers) {
      for (const mkt of bk.markets) {
        lines.push({
          gameId: ev.id,
          homeTeam: ev.home_team,
          awayTeam: ev.away_team,
          commenceTime: ev.commence_time,
          bookmaker: bk.title,
          market: mkt.key as NormalizedOddsLine['market'],
          outcomes: mkt.outcomes,
        });
      }
    }
  }
  return lines;
}

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ lines: [], warning: 'ODDS_API_KEY not set' });
  }

  try {
    const cached = getCached<NormalizedOddsLine[]>(CACHE_KEY);
    if (cached) return NextResponse.json({ lines: cached });

    const url = `https://api.the-odds-api.com/v4/sports/basketball_nba/odds?regions=us&markets=h2h,spreads,totals&oddsFormat=american&apiKey=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      return NextResponse.json({ error: 'Odds API error' }, { status: 502 });
    }

    const events: OddsEvent[] = await res.json();
    const lines = normalize(events);

    setCache(CACHE_KEY, lines, TTL);
    return NextResponse.json({ lines });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch odds' }, { status: 500 });
  }
}
