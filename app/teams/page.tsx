export const dynamic = 'force-dynamic';
import { headers } from 'next/headers';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

async function getTeams(baseUrl: string) {
  const res = await fetch(`${baseUrl}/api/teams`, { next: { revalidate: 3600 } });
  if (!res.ok) return { teams: [] as any[] };
  return res.json();
}

export default async function TeamsPage() {
  const host = headers().get('host') ?? 'localhost:3000';
  const baseUrl = /^(localhost|127\.0\.0\.1)/.test(host) ? `http://${host}` : `https://${host}`;
  const { teams } = await getTeams(baseUrl);

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold">NBA Teams</h1>
        <div className="grid gap-3 md:grid-cols-3">
          {(teams ?? []).map((team: any) => (
            <Link key={team.id} href={`/teams/${team.id}`} className="rounded-xl border bg-white p-4 shadow-sm hover:border-blue-300">
              <p className="font-semibold">{team.name ?? team.full_name}</p>
              <p className="text-sm text-slate-500">{team.city ?? team.conference}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
