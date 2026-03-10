export const dynamic = 'force-dynamic';
import { headers } from 'next/headers';
import Navbar from '@/components/Navbar';

async function getTeam(baseUrl: string, teamId: string) {
  const res = await fetch(`${baseUrl}/api/team/${teamId}`, { next: { revalidate: 600 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function TeamPage({ params }: { params: { teamId: string } }) {
  const host = headers().get('host') ?? 'localhost:3000';
  const baseUrl = /^(localhost|127\.0\.0\.1)/.test(host) ? `http://${host}` : `https://${host}`;
  const data = await getTeam(baseUrl, params.teamId);

  return <main><Navbar /><div className="mx-auto max-w-6xl space-y-4 px-4 py-6"><h1 className="text-2xl font-bold">{data?.team?.full_name}</h1><section className="rounded-xl border bg-white p-4 shadow-sm"><h2 className="mb-2 font-semibold">Roster</h2><div className="grid gap-1 text-sm md:grid-cols-2">{(data?.roster ?? []).map((p: any) => <p key={p.id}>{p.first_name} {p.last_name}</p>)}</div></section><section className="rounded-xl border bg-white p-4 shadow-sm"><h2 className="mb-2 font-semibold">Recent / Upcoming Games</h2>{(data?.recentGames ?? []).map((g: any) => (<p key={g.id} className="border-b py-1 text-sm">{g.home_team.full_name} vs {g.visitor_team.full_name} - {g.status}</p>))}</section></div></main>;
}
