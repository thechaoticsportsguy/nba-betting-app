import Image from 'next/image';
import Link from 'next/link';
import { NormalizedLiveGame } from '@/lib/types';

export default function LiveScoreboard({ games }: { games: NormalizedLiveGame[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {games.map((game) => (
        <article key={game.id} className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-2 text-xs text-slate-500">{game.shortStatus}</div>
          {[game.awayTeam, game.homeTeam].map((team) => (
            <div key={team.id} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Image src={team.logo} alt={team.name} width={24} height={24} />
                <span>{team.abbreviation}</span>
              </div>
              <span className="text-lg font-semibold">{team.score}</span>
            </div>
          ))}
          <div className="mt-2 text-xs text-slate-500">{game.status === 'pre' ? game.startTimeET : `${game.clock ?? ''} Q${game.period ?? ''}`}</div>
          <Link href={`/games/${game.id}`} className="mt-3 inline-block text-sm font-semibold text-blue-600">
            View box score →
          </Link>
        </article>
      ))}
    </section>
  );
}
