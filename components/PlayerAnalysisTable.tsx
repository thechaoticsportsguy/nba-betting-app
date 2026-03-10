import { PlayerAnalysis } from '@/lib/types';

const badge = (c: string) =>
  c === 'High' ? 'bg-emerald-500/20 text-emerald-300' : c === 'Medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300';

export default function PlayerAnalysisTable({ players }: { players: PlayerAnalysis[] }) {
  if (!players.length) {
    return <p className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-300">No players matched your filters.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-950 text-slate-300">
          <tr>
            {['Player', 'Team', 'Game', 'Market', 'Book', 'Line', 'Recent 5', 'Season', 'Projected', 'Edge', 'Confidence', 'Trend', 'Recommendation'].map((h) => (
              <th key={h} className="px-3 py-2 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((p, idx) => (
            <tr key={`${p.playerName}-${p.marketType}-${idx}`} className="border-t border-slate-800 text-slate-100">
              <td className="px-3 py-2 font-medium">{p.playerName}</td>
              <td className="px-3 py-2">{p.team}</td>
              <td className="px-3 py-2">{p.game}</td>
              <td className="px-3 py-2 capitalize">{p.marketType}</td>
              <td className="px-3 py-2">{p.sportsbook}</td>
              <td className="px-3 py-2">{p.line}</td>
              <td className="px-3 py-2">{p.recent5}</td>
              <td className="px-3 py-2">{p.seasonAvg}</td>
              <td className="px-3 py-2">{p.projectedValue}</td>
              <td className={`px-3 py-2 font-semibold ${p.edge >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{p.edge > 0 ? `+${p.edge}` : p.edge}</td>
              <td className="px-3 py-2"><span className={`rounded-full px-2 py-1 text-xs ${badge(p.confidence)}`}>{p.confidence}</span></td>
              <td className="px-3 py-2">{p.trend}</td>
              <td className="px-3 py-2">{p.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
