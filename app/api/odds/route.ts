import { NextResponse } from 'next/server';
import { normalizeOdds } from '@/lib/odds';

const ODDS_KEY = process.env.ODDS_API_KEY ?? 'b412e4d9246309c4aac12e3a6bdfee44';

export const revalidate = 45;

export async function GET() {
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
  }
}
