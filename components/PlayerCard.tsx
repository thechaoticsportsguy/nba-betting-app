import { EnrichedPlayer } from '@/lib/types';

export default function PlayerCard({ player }: { player: EnrichedPlayer }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-center gap-3">
        <img src={player.playerHeadshot} alt={player.name} className="h-12 w-12 rounded-full" />
        <div>
          <p className="font-semibold">{player.name}</p>
          <p className="text-xs text-slate-400">{player.team.name}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded bg-slate-800 py-2"><p className="font-bold">{player.points}</p><p className="text-xs text-slate-400">PTS</p></div>
        <div className="rounded bg-slate-800 py-2"><p className="font-bold">{player.rebounds}</p><p className="text-xs text-slate-400">REB</p></div>
        <div className="rounded bg-slate-800 py-2"><p className="font-bold">{player.assists}</p><p className="text-xs text-slate-400">AST</p></div>
      </div>
    </article>
  );
}
