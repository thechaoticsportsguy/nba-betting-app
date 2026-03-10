import type { LiveGame } from '@/lib/types';
import { toET } from '@/lib/format';
import Link from 'next/link';

const stateStyles: Record<string, string> = {
  in: 'bg-red-600/20 text-red-300 border-red-500/40',
  post: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40',
  pre: 'bg-amber-600/20 text-amber-300 border-amber-500/40',
};

const stateLabels: Record<string, string> = {
  in: 'LIVE',
  post: 'FINAL',
  pre: 'UPCOMING',
};

export default function ScoreboardCard({ game }: { game: LiveGame }) {
  return (
    <Link href={`/games/${game.id}`}>
      <article className="rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-600">
        <div className="mb-3 flex items-center justify-between">
          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${stateStyles[game.state] ?? stateStyles.pre}`}>
            {stateLabels[game.state] ?? game.state.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400">{game.shortDetail}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={game.awayTeam.logo} alt={game.awayTeam.name} className="h-8 w-8" />
              <div>
                <p className="text-sm font-medium">{game.awayTeam.name}</p>
                {game.awayTeam.record && <p className="text-xs text-slate-500">{game.awayTeam.record}</p>}
              </div>
            </div>
            <p className="text-lg font-bold">{game.awayTeam.score}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={game.homeTeam.logo} alt={game.homeTeam.name} className="h-8 w-8" />
              <div>
                <p className="text-sm font-medium">{game.homeTeam.name}</p>
                {game.homeTeam.record && <p className="text-xs text-slate-500">{game.homeTeam.record}</p>}
              </div>
            </div>
            <p className="text-lg font-bold">{game.homeTeam.score}</p>
          </div>
        </div>

        {game.state === 'pre' && (
          <p className="mt-2 text-xs text-slate-500">{toET(game.date)} ET {game.broadcast ? `· ${game.broadcast}` : ''}</p>
        )}
      </article>
    </Link>
  );
}
