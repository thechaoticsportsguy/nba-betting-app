import { NextResponse } from 'next/server';
import { getTeams } from '@/lib/data';

export async function GET() {
  const teams = await getTeams();
  return NextResponse.json({ teams });
import { withCache } from '@/lib/server/cache';

export async function GET() {
  const key = process.env.BALDONTLIE_API_KEY;
  if (!key) return NextResponse.json({ error: 'Missing BALDONTLIE_API_KEY' }, { status: 500 });

  try {
    const teams = await withCache('teams-all', 86400, async () => {
      const res = await fetch('https://api.balldontlie.io/v2/teams', {
        headers: { Authorization: key },
        next: { revalidate: 86400 }
      });
      if (!res.ok) throw new Error(`Teams fetch error: ${res.status}`);
      return res.json();
    });

    return NextResponse.json(teams);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
