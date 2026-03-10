import Link from 'next/link';
import type { BDLTeam, BDLPlayer, BDLPaginated } from '@/lib/types';

async function fetchTeam(id: string): Promise<BDLTeam | null> {
  const apiKey = process.env.BALLDONTLIE_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`https://api.balldontlie.io/v1/teams/${id}`, {
      headers: { Authorization: apiKey },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch {
    return null;
  }
}

async function fetchRoster(teamId: string): Promise<BDLPlayer[]> {
  const apiKey = process.env.BALLDONTLIE_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch(`https://api.balldontlie.io/v1/players?team_ids[]=${teamId}&per_page=50`, {
      headers: { Authorization: apiKey },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const json: BDLPaginated<BDLPlayer> = await res.json();
    return json.data;
  } catch {
    return [];
  }
}

export default async function TeamPage({ params }: { params: { teamId: string } }) {
  const [team, roster] = await Promise.all([fetchTeam(params.teamId), fetchRoster(params.teamId)]);

  if (!team) {
    return (
      <div className="space-y-4">
        <Link href="/teams" className="text-sm text-court hover:underline">Back to teams</Link>
        <p className="text-slate-400">Team not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/teams" className="text-sm text-court hover:underline">Back to teams</Link>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold">{team.full_name}</h1>
        <p className="mt-1 text-sm text-slate-400">{team.conference} Conference · {team.division} Division</p>
      </section>

      {roster.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Roster</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="pb-2 pr-4 text-left">Name</th>
                  <th className="pb-2 px-2 text-left">Pos</th>
                  <th className="pb-2 px-2 text-left">#</th>
                  <th className="pb-2 px-2 text-left">Height</th>
                  <th className="pb-2 px-2 text-left">Weight</th>
                  <th className="pb-2 px-2 text-left">College</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((p) => (
                  <tr key={p.id} className="border-b border-slate-800/50">
                    <td className="py-1.5 pr-4">
                      <Link href={`/players/${p.id}`} className="font-medium text-court hover:underline">
                        {p.first_name} {p.last_name}
                      </Link>
                    </td>
                    <td className="py-1.5 px-2 text-slate-400">{p.position || '—'}</td>
                    <td className="py-1.5 px-2 text-slate-400">{p.jersey_number || '—'}</td>
                    <td className="py-1.5 px-2 text-slate-400">{p.height || '—'}</td>
                    <td className="py-1.5 px-2 text-slate-400">{p.weight || '—'}</td>
                    <td className="py-1.5 px-2 text-slate-400">{p.college || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
