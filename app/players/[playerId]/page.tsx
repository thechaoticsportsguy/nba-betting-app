export const dynamic = 'force-dynamic';
import { headers } from 'next/headers';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PlayerTrendChart from '@/components/PlayerTrendChart';

async function getJson(baseUrl: string, path: string) {
  const res = await fetch(`${baseUrl}${path}`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function PlayerPage({ params }: { params: { playerId: string } }) {
  const host = headers().get('host') ?? 'localhost:3000';
  const baseUrl = /^(localhost|127\.0\.0\.1)/.test(host) ? `http://${host}` : `https://${host}`;

  const [details, stats] = await Promise.all([
    getJson(baseUrl, `/api/player-details/${params.playerId}`),
    getJson(baseUrl, `/api/players/${params.playerId}`)
  ]);

  const logs = (stats?.gameLogs ?? []).map((log: any) => ({ gameDate: log.game?.date?.slice(5, 10), pts: log.pts, reb: log.reb, ast: log.ast, gameId: log.game?.id }));

  return <main><Navbar /><div className="mx-auto max-w-6xl space-y-4 px-4 py-6"><h1 className="text-2xl font-bold">{details?.first_name} {details?.last_name}</h1><p className="rounded-xl border bg-white p-4 text-sm shadow-sm">{details?.position} • {details?.height} • {details?.weight} lbs • {details?.college} • Draft {details?.draft_year}</p><PlayerTrendChart data={logs} /><div className="rounded-xl border bg-white p-4 text-sm shadow-sm"><h2 className="mb-2 font-semibold">Recent Games</h2>{logs.map((g: any, idx: number) => (<Link key={idx} className="block border-b py-1 hover:text-blue-600" href={`/games/${g.gameId}`}>Game {g.gameId}: {g.pts} PTS / {g.reb} REB / {g.ast} AST</Link>))}</div></div></main>;
}
