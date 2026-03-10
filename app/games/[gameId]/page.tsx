export const dynamic = 'force-dynamic';
import { headers } from 'next/headers';
import Navbar from '@/components/Navbar';
import GameTabs from '@/components/GameTabs';

async function getJson(baseUrl: string, path: string) {
  const res = await fetch(`${baseUrl}${path}`, { next: { revalidate: 20 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function GamePage({ params }: { params: { gameId: string } }) {
  const host = headers().get('host') ?? 'localhost:3000';
  const baseUrl = /^(localhost|127\.0\.0\.1)/.test(host) ? `http://${host}` : `https://${host}`;

  const [summary, liveBoxScores, odds, apisports, pp] = await Promise.all([
    getJson(baseUrl, `/api/game-summary/${params.gameId}`),
    getJson(baseUrl, '/api/live-box-scores'),
    getJson(baseUrl, '/api/odds'),
    getJson(baseUrl, '/api/apisports-odds'),
    getJson(baseUrl, '/api/pp-bets')
  ]);

  return <main><Navbar /><div className="mx-auto max-w-6xl space-y-4 px-4 py-6"><h1 className="text-2xl font-bold">Game {params.gameId}</h1><GameTabs summary={summary} boxScores={liveBoxScores} betting={{ odds: odds?.odds ?? [], apisports: apisports ?? {}, pp: pp ?? {} }} /></div></main>;
}
