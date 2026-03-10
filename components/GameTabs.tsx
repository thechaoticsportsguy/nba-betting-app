'use client';

import { useState } from 'react';

export default function GameTabs({ summary, boxScores, betting }: { summary: any; boxScores: any; betting: any }) {
  const [tab, setTab] = useState<'summary' | 'stats' | 'betting'>('summary');

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex gap-2">
        {(['summary', 'stats', 'betting'] as const).map((t) => (
          <button
            key={t}
            className={`rounded-md px-3 py-1 text-sm ${tab === t ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}
            onClick={() => setTab(t)}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <div className="space-y-3 text-sm">
          <p>{summary?.header?.competitions?.[0]?.notes?.[0]?.headline ?? 'Live game summary unavailable.'}</p>
          <div>
            {(summary?.scoringPlays ?? []).slice(0, 10).map((play: any, idx: number) => (
              <p key={idx} className="border-b py-1">{play.text}</p>
            ))}
          </div>
        </div>
      )}

      {tab === 'stats' && (
        <pre className="overflow-auto rounded bg-slate-100 p-3 text-xs">{JSON.stringify(boxScores?.data ?? summary?.boxscore ?? {}, null, 2)}</pre>
      )}

      {tab === 'betting' && (
        <pre className="overflow-auto rounded bg-slate-100 p-3 text-xs">{JSON.stringify(betting, null, 2)}</pre>
      )}
    </div>
  );
}
