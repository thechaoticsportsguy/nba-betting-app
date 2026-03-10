import { EnrichedGame, EnrichedPlayer } from '@/lib/types';

export default function FeaturedGameCard({ game, players }: { game: EnrichedGame; players: EnrichedPlayer[] }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 p-6">
      <p className="mb-3 text-xs uppercase tracking-wide text-court">Featured Game</p>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={game.awayTeam.teamLogo} alt={game.awayTeam.name} className="h-12 w-12" />
              <div>
                <p className="font-semibold">{game.awayTeam.name}</p>
                <p className="text-sm text-slate-400">{game.awayScore}</p>
              </div>
            </div>
            <span className="text-2xl font-black text-slate-400">@</span>
            <div className="flex items-center gap-3">
              <img src={game.homeTeam.teamLogo} alt={game.homeTeam.name} className="h-12 w-12" />
              <div>
                <p className="font-semibold">{game.homeTeam.name}</p>
                <p className="text-sm text-slate-400">{game.homeScore}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 text-sm text-slate-300">
            <span className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold">{game.status}</span>
            <span>{game.quarter || 'Pregame'}</span>
            <span>{game.gameClock}</span>
          </div>

          <button className="mt-6 rounded-md bg-court px-4 py-2 text-sm font-semibold text-slate-950">View Game</button>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">Star Players</p>
          <div className="space-y-3">
            {players.slice(0, 2).map((player) => (
              <div key={player.id} className="flex items-center gap-2 rounded-lg bg-slate-900 p-2">
                <img src={player.playerHeadshot} alt={player.name} className="h-10 w-10 rounded-full" />
                <div>
                  <p className="text-sm font-medium">{player.name}</p>
                  <p className="text-xs text-slate-400">
                    {player.points} PTS • {player.rebounds} REB • {player.assists} AST
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
