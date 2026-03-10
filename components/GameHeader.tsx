import { MergedGame } from '@/lib/types';

export default function GameHeader({ game }: { game: MergedGame }) {
  return (
    <header className="mb-4 rounded-xl bg-slate-900 p-4 text-white">
      <p className="text-xs uppercase tracking-wide text-slate-300">{game.status}</p>
      <h2 className="mt-1 text-lg font-semibold">{game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation}</h2>
      <p className="mt-2 text-2xl font-bold">
        {game.awayTeam.score ?? 0} - {game.homeTeam.score ?? 0}
      </p>
      <p className="mt-1 text-sm text-slate-300">
        {game.isLive ? `Q${game.period ?? 0} • ${game.clock ?? 'Live'}` : new Date(game.startTime ?? '').toLocaleString()}
      </p>
    </header>
  );
}
