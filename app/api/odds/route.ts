import { NextResponse } from 'next/server';
import { GameOdds, OddsMarketTeam } from '@/lib/types';

const ODDS_KEY = process.env.ODDS_API_KEY ?? 'b412e4d9246309c4aac12e3a6bdfee44';

export const revalidate = 30;

const findOutcome = (outcomes: any[], teamName: string) => outcomes.find((o: any) => o.name === teamName);

export async function GET() {
  try {
    const url = new URL('https://api.the-odds-api.com/v4/sports/basketball_nba/odds');
    url.searchParams.set('apiKey', ODDS_KEY);
    url.searchParams.set('regions', 'us');
    url.searchParams.set('markets', 'h2h,spreads,totals');
    url.searchParams.set('oddsFormat', 'american');

    const response = await fetch(url.toString(), { next: { revalidate: 30 } });
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch odds' }, { status: 502 });
    }

    const payload = await response.json();
    const odds: GameOdds[] = (Array.isArray(payload) ? payload : []).map((game: any) => {
      const bookmaker = game.bookmakers?.[0];
      const markets = bookmaker?.markets ?? [];
      const h2h = markets.find((m: any) => m.key === 'h2h')?.outcomes ?? [];
      const spreads = markets.find((m: any) => m.key === 'spreads')?.outcomes ?? [];
      const totals = markets.find((m: any) => m.key === 'totals')?.outcomes ?? [];

      const homeName = game.home_team ?? 'Home';
      const awayName = game.away_team ?? 'Away';
      const homeMoneyline = findOutcome(h2h, homeName)?.price ?? null;
      const awayMoneyline = findOutcome(h2h, awayName)?.price ?? null;
      const homeSpread = findOutcome(spreads, homeName)?.point ?? null;
      const awaySpread = findOutcome(spreads, awayName)?.point ?? null;
      const totalPoint = totals[0]?.point ?? null;

      const home: OddsMarketTeam = {
        team: homeName,
        moneyline: homeMoneyline,
        spread: homeSpread,
        total: totalPoint
      };
      const away: OddsMarketTeam = {
        team: awayName,
        moneyline: awayMoneyline,
        spread: awaySpread,
        total: totalPoint
      };

      return {
        gameId: String(game.id ?? `${awayName}@${homeName}`),
        sportsbook: bookmaker?.title ?? 'Unknown',
        home,
        away
      };
    });

    return NextResponse.json({ odds });
  } catch {
    return NextResponse.json({ error: 'Unexpected error loading odds' }, { status: 500 });
  }
}
