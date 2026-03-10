import ScoreStatus from '@/components/ScoreStatus';
import { ESPNGame } from '@/lib/types';

export default function GameCard({ game, onClick }: { game: ESPNGame; onClick: (game: ESPNGame) => void }) {
  return (
    <button
      onClick={() => onClick(game)}
      className="w-full cursor-pointer rounded-2xl border border-slate-700/50 bg-slate-900 p-4 text-left text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">{game.isLive ? 'Live' : 'Game'}</span>
        <ScoreStatus game={game} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {game.awayTeam.logo ? <img src={game.awayTeam.logo} alt={game.awayTeam.name} className="h-9 w-9 rounded-full bg-white" /> : null}
            <div>
              <p className="text-sm font-semibold">{game.awayTeam.abbreviation}</p>
              <p className="text-xs text-slate-400">{game.awayTeam.name}</p>
            </div>
          </div>
          <span className="text-2xl font-bold">{game.awayTeam.score ?? 0}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {game.homeTeam.logo ? <img src={game.homeTeam.logo} alt={game.homeTeam.name} className="h-9 w-9 rounded-full bg-white" /> : null}
            <div>
              <p className="text-sm font-semibold">{game.homeTeam.abbreviation}</p>
              <p className="text-xs text-slate-400">{game.homeTeam.name}</p>
            </div>
          </div>
          <span className="text-2xl font-bold">{game.homeTeam.score ?? 0}</span>
        </div>
      </div>
    </button>
  );
}
