export const dynamic = 'force-dynamic';
import { headers } from 'next/headers';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import teamsData from '@/data/teams.json';
import playersData from '@/data/players.json';
import { TEAM_META } from '@/lib/bdlTeamIds';

// Top scorer from local roster for a given team id
function topScorer(teamId: string) {
  const roster = (playersData as any[]).filter((p) => p.teamId === teamId);
  if (!roster.length) return null;
  return roster.sort((a: any, b: any) => b.points - a.points)[0] as { name: string; points: number };
}

const EAST = ['ATL','BOS','BKN','CHA','CHI','CLE','DET','IND','MIA','MIL','NYK','ORL','PHI','TOR','WAS'];
const WEST = ['DAL','DEN','GSW','HOU','LAC','LAL','MEM','MIN','NOP','OKC','PHX','POR','SAC','SAS','UTA'];

export default async function TeamsPage() {
  const host = headers().get('host') ?? 'localhost:3000';
  const baseUrl = /^(localhost|127\.0\.0\.1)/.test(host) ? `http://${host}` : `https://${host}`;

  // Fetch today's games to show "game today" indicator on team cards
  let gameTeams = new Set<string>();
  try {
    const liveRes = await fetch(`${baseUrl}/api/live-games`, { next: { revalidate: 60 } });
    if (liveRes.ok) {
      const liveData = await liveRes.json();
      for (const g of liveData.games ?? []) {
        gameTeams.add(g.homeTeam?.name?.toLowerCase() ?? '');
        gameTeams.add(g.awayTeam?.name?.toLowerCase() ?? '');
        gameTeams.add(g.homeTeam?.abbreviation?.toLowerCase() ?? '');
        gameTeams.add(g.awayTeam?.abbreviation?.toLowerCase() ?? '');
      }
    }
  } catch { /* ignore */ }

  const teams = teamsData as any[];
  const eastTeams = teams.filter((t) => EAST.includes((t.abbreviation ?? t.id?.toUpperCase())));
  const westTeams = teams.filter((t) => WEST.includes((t.abbreviation ?? t.id?.toUpperCase())));

  function TeamCard({ team }: { team: any }) {
    const abbrev = (team.abbreviation ?? team.id ?? '').toUpperCase();
    const top = topScorer(team.id);
    const meta = TEAM_META[abbrev] ?? {};
    const hasGame = gameTeams.has(team.name?.toLowerCase()) || gameTeams.has(abbrev.toLowerCase());
    const players = (playersData as any[]).filter((p) => p.teamId === team.id);

    return (
      <Link
        href={`/teams/${team.id}`}
        className="group block rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-orange-500/60 hover:bg-slate-900"
      >
        <div className="mb-3 flex items-start justify-between">
          <span className="rounded-md bg-orange-500/10 px-2 py-1 text-sm font-extrabold text-orange-400">
            {abbrev}
          </span>
          {hasGame && (
            <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              Playing
            </span>
          )}
        </div>

        <p className="mb-0.5 font-bold text-white">{team.name}</p>
        <p className="mb-3 text-xs text-slate-500">{meta.conference ?? ''} · {meta.division ?? ''}</p>

        {/* Mini roster preview */}
        <div className="space-y-1">
          {players.slice(0, 3).map((p: any) => (
            <div key={p.id} className="flex items-center justify-between text-xs">
              <span className="text-slate-300">{p.name}</span>
              <span className="text-orange-400 font-semibold">{p.points} pts</span>
            </div>
          ))}
          {players.length > 3 && (
            <p className="text-xs text-slate-600">+{players.length - 3} more</p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-1 text-3xl font-extrabold text-white">NBA Teams</h1>
        <p className="mb-8 text-sm text-slate-500">All 30 teams · roster, averages & AI game analysis</p>

        <div className="space-y-10">
          <div>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-orange-500">Eastern Conference</h2>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {eastTeams.sort((a, b) => a.name.localeCompare(b.name)).map((t) => (
                <TeamCard key={t.id} team={t} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-orange-500">Western Conference</h2>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {westTeams.sort((a, b) => a.name.localeCompare(b.name)).map((t) => (
                <TeamCard key={t.id} team={t} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
