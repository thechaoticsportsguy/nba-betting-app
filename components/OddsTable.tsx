'use client';

import { useState } from 'react';
import type { NormalizedOddsLine } from '@/lib/types';
import { formatOdds, americanToDecimal } from '@/lib/format';

export default function OddsTable({ lines }: { lines: NormalizedOddsLine[] }) {
  const [decimal, setDecimal] = useState(false);
  const [marketFilter, setMarketFilter] = useState<string>('all');
  const [bookFilter, setBookFilter] = useState<string>('all');

  const bookmakers = Array.from(new Set(lines.map((l) => l.bookmaker))).sort();
  const markets = Array.from(new Set(lines.map((l) => l.market))).sort();

  const filtered = lines.filter((l) => {
    if (marketFilter !== 'all' && l.market !== marketFilter) return false;
    if (bookFilter !== 'all' && l.bookmaker !== bookFilter) return false;
    return true;
  });

  function displayOdds(price: number) {
    return decimal ? americanToDecimal(price).toFixed(2) : formatOdds(price);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={marketFilter}
          onChange={(e) => setMarketFilter(e.target.value)}
          className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm"
        >
          <option value="all">All Markets</option>
          {markets.map((m) => (
            <option key={m} value={m}>{m === 'h2h' ? 'Moneyline' : m === 'spreads' ? 'Spread' : 'Totals'}</option>
          ))}
        </select>
        <select
          value={bookFilter}
          onChange={(e) => setBookFilter(e.target.value)}
          className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm"
        >
          <option value="all">All Bookmakers</option>
          {bookmakers.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input type="checkbox" checked={decimal} onChange={() => setDecimal(!decimal)} className="accent-court" />
          Decimal odds
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No odds data available. Set ODDS_API_KEY to fetch live lines.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs text-slate-400">
                <th className="pb-2 pr-4">Game</th>
                <th className="pb-2 pr-4">Bookmaker</th>
                <th className="pb-2 pr-4">Market</th>
                <th className="pb-2 pr-4">Outcomes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((line, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="py-2 pr-4 font-medium">{line.awayTeam} @ {line.homeTeam}</td>
                  <td className="py-2 pr-4 text-slate-400">{line.bookmaker}</td>
                  <td className="py-2 pr-4">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-xs">
                      {line.market === 'h2h' ? 'ML' : line.market === 'spreads' ? 'SPR' : 'TOT'}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-3">
                      {line.outcomes.map((o, j) => (
                        <span key={j} className="text-xs">
                          {o.name} {o.point !== undefined ? `${o.point > 0 ? '+' : ''}${o.point}` : ''}{' '}
                          <span className="font-semibold text-court">{displayOdds(o.price)}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
