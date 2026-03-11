import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import HomeControlCenter from '@/components/HomeControlCenter';
import { getBaseUrl } from '@/lib/server/baseUrl';
import { ESPNGame } from '@/lib/types';

async function getLiveGames(baseUrl: string): Promise<ESPNGame[]> {
  try {
    const res = await fetch(`${baseUrl}/api/live-games`, { next: { revalidate: 15 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.games) ? data.games : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const baseUrl = getBaseUrl();
  const games = await getLiveGames(baseUrl);

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Image src="/app-logo.svg" alt="NBA Live Odds logo" width={64} height={64} />
            <div>
              <h1 className="text-3xl font-bold">NBA Live Games Center</h1>
              <p className="text-slate-200">Live scores front page. Click any game for player points/rebounds/assists, live updates, and betting odds.</p>
            </div>
          </div>
          <div className="flex gap-2 text-sm">
            <Link href="/betting" className="rounded bg-orange-500 px-3 py-2 font-semibold text-slate-950 hover:bg-orange-400">Open Betting</Link>
            <Link href="/teams" className="rounded border border-slate-500 px-3 py-2 hover:bg-slate-700">Teams</Link>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Today&apos;s Games & Scores</h2>
            <a href="/api/live-games" className="text-sm text-blue-600 hover:underline" target="_blank">Open live-games API</a>
          </div>

          {games.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              No game data available right now. Check API status below and retry.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {games.map((game) => (
                <Link key={game.id} href={`/games/${game.id}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300">
                  <div className="mb-2 text-xs font-medium text-slate-500">{game.status}</div>
                  {[game.awayTeam, game.homeTeam].map((team) => (
                    <div key={team.id} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        {team.logo ? <img src={team.logo} alt={team.name} className="h-6 w-6" /> : null}
                        <span className="font-medium">{team.abbreviation}</span>
                      </div>
                      <span className="text-xl font-bold">{team.score ?? 0}</span>
                    </div>
                  ))}
                  <p className="mt-2 text-xs text-slate-500">{game.clock ? `${game.clock} • Q${game.period}` : new Date(game.startTime).toLocaleString()}</p>
                  <p className="mt-3 text-sm font-semibold text-blue-600">Open game details →</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <HomeControlCenter />
      </section>
    </main>
  );
}
