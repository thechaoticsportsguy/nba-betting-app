import OddsTable from '@/components/OddsTable';
import type { NormalizedOddsLine, PPBet } from '@/lib/types';

async function fetchOdds(): Promise<NormalizedOddsLine[]> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) return [];
  try {
    const url = `https://api.the-odds-api.com/v4/sports/basketball_nba/odds?regions=us&markets=h2h,spreads,totals&oddsFormat=american&apiKey=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const events = await res.json();
    const lines: NormalizedOddsLine[] = [];
    for (const ev of events) {
      for (const bk of ev.bookmakers ?? []) {
        for (const mkt of bk.markets ?? []) {
          lines.push({
            gameId: ev.id,
            homeTeam: ev.home_team,
            awayTeam: ev.away_team,
            commenceTime: ev.commence_time,
            bookmaker: bk.title,
            market: mkt.key,
            outcomes: mkt.outcomes,
          });
        }
      }
    }
    return lines;
  } catch {
    return [];
  }
}

async function fetchPPBets(): Promise<PPBet[]> {
  const apiKey = process.env.PP_API_KEY;
  const apiUrl = process.env.PP_API_URL;
  if (!apiKey || !apiUrl) return [];
  try {
    const res = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function BettingPage() {
  const [odds, ppBets] = await Promise.all([fetchOdds(), fetchPPBets()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Betting Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          NBA betting lines across bookmakers. Filter by market and sportsbook.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Odds</h2>
        <OddsTable lines={odds} />
      </section>

      {ppBets.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Player Props (PP)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="pb-2 pr-4 text-left">Player</th>
                  <th className="pb-2 pr-4 text-left">Market</th>
                  <th className="pb-2 pr-4 text-right">Line</th>
                  <th className="pb-2 pr-4 text-right">Over</th>
                  <th className="pb-2 text-right">Under</th>
                </tr>
              </thead>
              <tbody>
                {ppBets.map((bet) => (
                  <tr key={bet.id} className="border-b border-slate-800/50">
                    <td className="py-2 pr-4 font-medium">{bet.player ?? '—'}</td>
                    <td className="py-2 pr-4 text-slate-400">{bet.market}</td>
                    <td className="py-2 pr-4 text-right">{bet.line}</td>
                    <td className="py-2 pr-4 text-right text-court">{bet.overOdds > 0 ? '+' : ''}{bet.overOdds}</td>
                    <td className="py-2 text-right text-slate-300">{bet.underOdds > 0 ? '+' : ''}{bet.underOdds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
