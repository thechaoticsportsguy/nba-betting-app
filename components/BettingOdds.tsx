import { GameOdds } from '@/lib/types';

export default function BettingOdds({ odds }: { odds: GameOdds | null }) {
  if (!odds) {
    return <p className="text-sm text-slate-500">No betting data available.</p>;
  }

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <h3 className="mb-1 text-sm font-semibold text-slate-800">BETTING MARKETS</h3>
      <p className="mb-3 text-xs text-slate-500">Sportsbook: {odds.sportsbook}</p>
      <div className="space-y-3 text-sm text-slate-700">
        <div>
          <p className="font-semibold">Moneyline</p>
          <p>{odds.away.team} {odds.away.moneyline ?? 'N/A'}</p>
          <p>{odds.home.team} {odds.home.moneyline ?? 'N/A'}</p>
        </div>
        <div>
          <p className="font-semibold">Spread</p>
          <p>{odds.away.team} {odds.away.spread ?? 'N/A'}</p>
          <p>{odds.home.team} {odds.home.spread ?? 'N/A'}</p>
        </div>
        <div>
          <p className="font-semibold">Total</p>
          <p>O/U {odds.home.total ?? 'N/A'}</p>
        </div>
      </div>
    </section>
  );
}
