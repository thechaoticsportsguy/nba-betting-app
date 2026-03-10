import { BestOverPlayer } from '@/lib/types';

export default function BestOverTable({ players }: { players: BestOverPlayer[] }) {
  if (!players.length) {
    return <p className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-300">No over-performers found yet for available prop lines.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-950 text-slate-300">
          <tr>
            {['Player', 'Team', 'Game', 'Stat', 'Line', 'Recent Avg', 'Edge', 'Odds', 'Sportsbook', 'Recommendation'].map((h) => (
              <th key={h} className="px-3 py-2 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={`${p.player}-${p.statType}-${i}`} className="border-t border-slate-800 text-slate-100">
              <td className="px-3 py-2 font-medium">{p.player}</td>
              <td className="px-3 py-2">{p.team}</td>
              <td className="px-3 py-2">{p.game}</td>
              <td className="px-3 py-2">{p.statType}</td>
              <td className="px-3 py-2">{p.line}</td>
              <td className="px-3 py-2">{p.recentAvg}</td>
              <td className="px-3 py-2 text-emerald-300">+{p.edge}</td>
              <td className="px-3 py-2">{p.odds ?? 'N/A'}</td>
              <td className="px-3 py-2">{p.sportsbook}</td>
              <td className="px-3 py-2">
                <span className={`rounded-full px-2 py-1 text-xs ${p.recommendation === 'Strong Over' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {p.recommendation}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
