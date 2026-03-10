'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { BDLGameStats } from '@/lib/types';

export default function PlayerStatsChart({ games }: { games: BDLGameStats[] }) {
  const data = [...games]
    .reverse()
    .map((g) => ({
      date: new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      PTS: g.pts,
      REB: g.reb,
      AST: g.ast,
    }));

  if (data.length === 0) {
    return <p className="text-sm text-slate-500">No recent game data available.</p>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#475569" />
          <YAxis tick={{ fontSize: 11 }} stroke="#475569" />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
          <Legend />
          <Line type="monotone" dataKey="PTS" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="REB" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="AST" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
