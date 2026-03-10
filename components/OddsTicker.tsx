'use client';

import { useEffect, useState } from 'react';
import type { NormalizedOddsLine } from '@/lib/types';
import { formatOdds } from '@/lib/format';

export default function OddsTicker() {
  const [lines, setLines] = useState<NormalizedOddsLine[]>([]);

  useEffect(() => {
    fetch('/api/odds')
      .then((r) => r.json())
      .then((d) => setLines((d.lines ?? []).slice(0, 20)))
      .catch(() => {});
  }, []);

  if (lines.length === 0) return null;

  const h2hLines = lines.filter((l) => l.market === 'h2h');
  const unique = new Map<string, NormalizedOddsLine>();
  for (const l of h2hLines) {
    if (!unique.has(l.gameId)) unique.set(l.gameId, l);
  }
  const display = Array.from(unique.values());

  if (display.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2">
      <div className="flex items-center gap-6 overflow-x-auto text-xs whitespace-nowrap">
        <span className="font-semibold text-court shrink-0">Lines</span>
        {display.map((l) => (
          <span key={l.gameId} className="text-slate-300 shrink-0">
            {l.awayTeam} @ {l.homeTeam}{' '}
            {l.outcomes.map((o) => (
              <span key={o.name} className="ml-1 text-slate-400">
                {o.name.split(' ').pop()} <span className="font-semibold text-slate-200">{formatOdds(o.price)}</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
