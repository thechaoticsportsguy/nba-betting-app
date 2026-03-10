import { NextResponse } from 'next/server';
import { normalizeOdds } from '@/lib/odds';

const ODDS_KEY = process.env.ODDS_API_KEY;
const ODDS_KEY = process.env.ODDS_API_KEY ?? 'b412e4d9246309c4aac12e3a6bdfee44';

export const revalidate = 45;

export async function GET() {
  if (!ODDS_KEY) {
    return NextResponse.json({ error: 'ODDS_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const url = new URL('https://api.the-odds-api.com/v4/sports/basketball_nba/odds');
    url.searchParams.set('apiKey', ODDS_KEY);
    url.searchParams.set('regions', 'us');
    url.searchParams.set('markets', 'h2h,spreads,totals');
    url.searchParams.set('oddsFormat', 'american');

    const response = await fetch(url.toString(), { next: { revalidate: 45 } });
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch odds' }, { status: 502 });
    }

    const payload = await response.json();
    return NextResponse.json(normalizeOdds(payload));
  } catch {
    return NextResponse.json({ error: 'Unexpected error loading odds' }, { status: 500 });
import { withCache } from '@/lib/server/cache';

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing ODDS_API_KEY' }, { status: 500 });
  }

  try {
    const data = await withCache('odds-api-nba', 60, async () => {
      const url = `https://api.the-odds-api.com/v4/sports/basketball_nba/odds?regions=us&markets=h2h,spreads,totals&oddsFormat=american&apiKey=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) throw new Error(`Odds API error: ${res.status}`);
      const json = await res.json();

      return json.map((game: any) => ({
        id: game.id,
        commenceTime: game.commence_time,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        bookmakers: (game.bookmakers ?? []).map((book: any) => ({
          key: book.key,
          title: book.title,
          markets: (book.markets ?? []).map((market: any) => ({
            key: market.key,
            outcomes: market.outcomes
          }))
        }))
      }));
    });

    return NextResponse.json({ odds: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
