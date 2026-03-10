'use client';

import { useMemo, useState } from 'react';
import { toAmericanOdds, toDecimalOdds } from '@/lib/server/time';

export default function BettingDashboard({ odds, propsData }: { odds: any[]; propsData: any }) {
  const [bookmaker, setBookmaker] = useState('all');
  const [format, setFormat] = useState<'american' | 'decimal'>('american');

  const rows = useMemo(() => odds.flatMap((game) =>
    (game.bookmakers ?? []).filter((b: any) => bookmaker === 'all' || b.key === bookmaker).flatMap((book: any) =>
      (book.markets ?? []).flatMap((market: any) =>
        (market.outcomes ?? []).map((outcome: any) => ({ game, book, market, outcome }))
      )
    )
  ), [odds, bookmaker]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <select className="rounded border p-2" value={bookmaker} onChange={(e) => setBookmaker(e.target.value)}>
          <option value="all">All books</option>
          {[...new Set(odds.flatMap((g) => (g.bookmakers ?? []).map((b: any) => b.key)))].map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <button className="rounded border px-3" onClick={() => setFormat(format === 'american' ? 'decimal' : 'american')}>
          Odds: {format}
        </button>
      </div>

      <div className="overflow-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr><th className="p-2">Game</th><th>Book</th><th>Market</th><th>Outcome</th><th>Price</th></tr>
          </thead>
          <tbody>
            {rows.slice(0, 250).map((row: any, idx: number) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{row.game.awayTeam} @ {row.game.homeTeam}</td>
                <td>{row.book.title}</td>
                <td>{row.market.key}</td>
                <td>{row.outcome.name}</td>
                <td>{format === 'american' ? toAmericanOdds(row.outcome.price) : toDecimalOdds(row.outcome.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <pre className="rounded-xl border bg-white p-3 text-xs shadow-sm">PP/API-SPORTS props snapshot: {JSON.stringify(propsData).slice(0, 2000)}</pre>
    </div>
  );
}
