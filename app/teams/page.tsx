import Link from 'next/link';
import type { BDLTeam } from '@/lib/types';

async function fetchTeams(): Promise<BDLTeam[]> {
  const apiKey = process.env.BALLDONTLIE_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch('https://api.balldontlie.io/v1/teams', {
      headers: { Authorization: apiKey },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function TeamsPage() {
  const teams = await fetchTeams();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">NBA Teams</h1>

      {teams.length === 0 ? (
        <p className="text-sm text-slate-400">
          Set <code className="bg-slate-800 px-1 rounded text-xs">BALLDONTLIE_API_KEY</code> to load teams from the API.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-600">
                <h2 className="text-lg font-semibold">{team.full_name}</h2>
                <div className="mt-1 flex gap-3 text-sm text-slate-400">
                  <span>{team.abbreviation}</span>
                  <span>{team.conference} · {team.division}</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
