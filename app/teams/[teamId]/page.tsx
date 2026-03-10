export const dynamic = 'force-dynamic';
import { headers } from 'next/headers';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TeamAnalysisPanel from '@/components/TeamAnalysisPanel';

async function getTeamData(baseUrl: string, teamId: string) {
  try {
    const res = await fetch(`${baseUrl}/api/team/${teamId}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getLiveGames(baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/api/live-games`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const d = await res.json();
    return d.games ?? [];
  } catch { return []; }
}

export default async function TeamPage({ params }: { params: { teamId: string } }) {
  const host = headers().get('host') ?? 'localhost:3000';
  const baseUrl = /^(localhost|127\.0\.0\.1)/.test(host) ? `http://${host}` : `https://${host}`;

  const [data, allGames] = await Promise.all([
    getTeamData(baseUrl, params.teamId),
    getLiveGames(baseUrl),
  ]);

  const team = data?.team;
  const roster: any[] = (data?.roster ?? data?.localPlayers ?? []);
  const recentGames: any[] = data?.recentGames ?? [];

  // Find today's game for this team in live ESPN games
  const abbrev = (team?.abbreviation ?? params.teamId).toUpperCase();
  const liveGame = allGames.find((g: any) =>
    g.homeTeam?.abbreviation?.toUpperCase() === abbrev ||
    g.awayTeam?.abbreviation?.toUpperCase() === abbrev ||
    g.homeTeam?.name?.toLowerCase().includes((team?.name ?? '').toLowerCase()) ||
    g.awayTeam?.name?.toLowerCase().includes((team?.name ?? '').toLowerCase())
  ) ?? null;

  if (!team) {
    return (
      <main className="min-h-screen bg-black">
        <Navbar />
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          <p className="text-slate-400">Team not found.</p>
          <Link href="/teams" className="mt-4 inline-block text-orange-400 hover:underline">← Back to teams</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Back */}
        <Link href="/teams" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white">
          ← All Teams
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start gap-4">
          <span className="rounded-xl bg-orange-500/10 px-4 py-2 text-2xl font-extrabold text-orange-400">{abbrev}</span>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold text-white">{team.name}</h1>
              {liveGame && (
                <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-sm font-semibold text-red-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                  Live
                </span>
              )}
            </div>
            <p className="mt-1 text-slate-500">{team.conference} Conference · {team.division}</p>
          </div>
        </div>

        {/* Live game inline score */}
        {liveGame && (
          <div className="mb-8 rounded-xl border border-red-900/40 bg-red-950/20 p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-red-400">Game in Progress · {liveGame.shortStatus}</p>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-300">{liveGame.awayTeam.name}</div>
                <div className="text-4xl font-extrabold text-white">{liveGame.awayTeam.score ?? '–'}</div>
              </div>
              <div className="text-xl text-slate-600">@</div>
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-300">{liveGame.homeTeam.name}</div>
                <div className="text-4xl font-extrabold text-white">{liveGame.homeTeam.score ?? '–'}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Roster — full width on left */}
          <div className="lg:col-span-2">
            <h2 className="mb-3 text-xl font-bold text-white">Roster &amp; Season Averages</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-sm">
                <thead className="bg-black text-xs text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-left">Player</th>
                    <th className="px-4 py-3 text-left">Pos</th>
                    <th className="px-4 py-3 text-right">PTS</th>
                    <th className="px-4 py-3 text-right">REB</th>
                    <th className="px-4 py-3 text-right">AST</th>
                  </tr>
                </thead>
                <tbody>
                  {roster
                    .sort((a: any, b: any) => (Number(b.points) || 0) - (Number(a.points) || 0))
                    .map((p: any, i: number) => {
                      const name = p.name ?? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim();
                      return (
                        <tr key={p.id ?? i} className="border-t border-slate-800/50 hover:bg-slate-900/40">
                          <td className="px-4 py-3 font-medium text-white">{name}</td>
                          <td className="px-4 py-3 text-slate-500">{p.position || '—'}</td>
                          <td className="px-4 py-3 text-right font-bold text-orange-400">
                            {p.points != null ? Number(p.points).toFixed(1) : '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300">
                            {p.rebounds != null ? Number(p.rebounds).toFixed(1) : '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300">
                            {p.assists != null ? Number(p.assists).toFixed(1) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  {roster.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No roster data.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column: AI + Games */}
          <div className="space-y-6">
            <TeamAnalysisPanel team={team} liveGame={liveGame} />

            {recentGames.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold text-white">Recent Games</h2>
                <div className="space-y-2">
                  {recentGames.slice(0, 8).map((g: any) => (
                    <div key={g.id} className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                      <p className="text-xs text-slate-500">{String(g.date ?? '').split('T')[0]}</p>
                      <p className="text-sm font-medium text-white">{g.awayTeam} @ {g.homeTeam}</p>
                      {g.homeScore != null && (
                        <p className="text-xs text-slate-400">{g.awayScore} – {g.homeScore} · {g.status}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
