import Link from 'next/link';
import { PlayerProfile } from '@/lib/types';
import { normalizePlayerProfile } from '@/lib/balldontlie';

const BALLDONTLIE_KEY = process.env.BALLDONTLIE_API_KEY;

async function getPlayer(id: string): Promise<PlayerProfile | null> {
  if (!BALLDONTLIE_KEY) return null;

const BALLDONTLIE_KEY = process.env.BALLDONTLIE_API_KEY ?? '5961d28b-ac82-4980-ba1e-de7454c1511a';

async function getPlayer(id: string): Promise<PlayerProfile | null> {
  try {
    const res = await fetch(`https://api.balldontlie.io/v1/players/${id}`, {
      headers: { Authorization: BALLDONTLIE_KEY },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return normalizePlayerProfile(payload);
  } catch {
    return null;
  }
}

export default async function PlayerDetailPage({ params }: { params: { id: string } }) {
  const player = await getPlayer(params.id);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6">
        <Link href="/" className="text-sm text-slate-400 hover:text-white">← Back to dashboard</Link>
        {!player ? (
          <p className="mt-4 text-slate-300">Player details unavailable.</p>
        ) : (
          <div className="mt-4 space-y-2">
            <h1 className="text-2xl font-bold">{player.firstName} {player.lastName}</h1>
            <p className="text-slate-300">Team: {player.team || 'N/A'}</p>
            <p className="text-slate-300">Position: {player.position || 'N/A'}</p>
            <p className="text-slate-300">Height: {player.height || 'N/A'}</p>
            <p className="text-slate-300">Weight: {player.weight || 'N/A'}</p>
            <p className="text-slate-300">Jersey: {player.jerseyNumber || 'N/A'}</p>
            <p className="text-slate-300">College: {player.college || 'N/A'}</p>
            <p className="text-slate-300">Country: {player.country || 'N/A'}</p>
          </div>
        )}
      </div>
    </main>
  );
}
