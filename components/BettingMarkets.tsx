import { OddsGame } from '@/lib/types';

const fmt = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return 'N/A';
  return n > 0 ? `+${n}` : `${n}`;
};

export default function BettingMarkets({ odds }: { odds?: OddsGame }) {
  if (!odds) {
    return <p className="text-sm text-slate-500">Odds unavailable for this game.</p>;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <h3 className="mb-2 text-sm font-semibold text-slate-800">BETTING MARKETS</h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-medium">Moneyline</p>
          <p>{odds.awayTeam} {fmt(odds.bestOdds.moneyline.away)}</p>
          <p>{odds.homeTeam} {fmt(odds.bestOdds.moneyline.home)}</p>
        </div>
        <div>
          <p className="font-medium">Spread</p>
          <p>
            {odds.awayTeam} {odds.bestOdds.spread.away.point ?? 'N/A'} ({fmt(odds.bestOdds.spread.away.price)})
          </p>
          <p>
            {odds.homeTeam} {odds.bestOdds.spread.home.point ?? 'N/A'} ({fmt(odds.bestOdds.spread.home.price)})
          </p>
        </div>
        <div>
          <p className="font-medium">Total</p>
          <p>Over {odds.bestOdds.total.over.point ?? 'N/A'} ({fmt(odds.bestOdds.total.over.price)})</p>
          <p>Under {odds.bestOdds.total.under.point ?? 'N/A'} ({fmt(odds.bestOdds.total.under.price)})</p>
        </div>
      </div>

      {odds.bookmakers.length > 0 ? (
        <details className="mt-3 text-xs text-slate-600">
          <summary className="cursor-pointer font-medium">Sportsbooks</summary>
          <ul className="mt-1 list-disc pl-4">
            {odds.bookmakers.map((book) => (
              <li key={book.key}>{book.title}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
