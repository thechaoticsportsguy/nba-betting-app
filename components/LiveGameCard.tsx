import { EnrichedGame } from '@/lib/types';

const statusStyles: Record<EnrichedGame['status'], string> = {
  LIVE: 'bg-red-600/20 text-red-300 border-red-500/40',
  FINAL: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40',
  UPCOMING: 'bg-amber-600/20 text-amber-300 border-amber-500/40'
};

export default function LiveGameCard({ game }: { game: EnrichedGame }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusStyles[game.status]}`}>{game.status}</span>
        <span className="text-xs text-slate-400">{game.quarter || 'Pregame'} • {game.gameClock}</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={game.awayTeam.teamLogo} alt={game.awayTeam.name} className="h-8 w-8" />
            <p className="text-sm font-medium">{game.awayTeam.name}</p>
          </div>
          <p className="text-lg font-bold">{game.awayScore}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={game.homeTeam.teamLogo} alt={game.homeTeam.name} className="h-8 w-8" />
            <p className="text-sm font-medium">{game.homeTeam.name}</p>
          </div>
          <p className="text-lg font-bold">{game.homeScore}</p>
        </div>
      </div>
    </article>
  );
}
