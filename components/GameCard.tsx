import { LiveGame } from '@/lib/types';

export default function GameCard({ game, onClick }: { game: LiveGame; onClick: (game: LiveGame) => void }) {
  return (
    <button
      onClick={() => onClick(game)}
      className="w-full rounded-xl bg-white p-4 text-left text-slate-900 shadow-md transition hover:shadow-xl"
    >
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>{game.status}</span>
        <span>{game.period > 0 ? `Q${game.period}` : ''} {game.clock}</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {game.awayTeam.logo ? <img src={game.awayTeam.logo} alt={game.awayTeam.name} className="h-8 w-8" /> : null}
            <span className="font-medium">{game.awayTeam.abbreviation}</span>
          </div>
          <span className="text-2xl font-bold">{game.awayTeam.score}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {game.homeTeam.logo ? <img src={game.homeTeam.logo} alt={game.homeTeam.name} className="h-8 w-8" /> : null}
            <span className="font-medium">{game.homeTeam.abbreviation}</span>
          </div>
          <span className="text-2xl font-bold">{game.homeTeam.score}</span>
        </div>
      </div>
    </button>
  );
}
