'use client';

export default function PlayerTrendChart({ data }: { data: { gameDate: string; pts: number; reb: number; ast: number }[] }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.pts, d.reb, d.ast]));
  const points = (key: 'pts' | 'reb' | 'ast') =>
    data
      .map((d, i) => `${(i / Math.max(1, data.length - 1)) * 100},${100 - (d[key] / max) * 100}`)
      .join(' ');

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="mb-2 font-semibold">Recent Trend (PTS / REB / AST)</h2>
      <svg viewBox="0 0 100 100" className="h-64 w-full rounded bg-slate-50">
        <polyline fill="none" stroke="currentColor" strokeWidth="1" points={points('pts')} />
        <polyline fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" points={points('reb')} />
        <polyline fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" points={points('ast')} />
      </svg>
    </div>
  );
}
