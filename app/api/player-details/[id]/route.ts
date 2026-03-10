import { NextResponse } from 'next/server';
import { withCache } from '@/lib/server/cache';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const key = process.env.BALLS_API_KEY;
  if (!key) return NextResponse.json({ error: 'Missing BALLS_API_KEY' }, { status: 500 });

  try {
    const player = await withCache(`player-details-${params.id}`, 3600, async () => {
      const res = await fetch(`https://api.balldontlie.io/v1/players/${params.id}`, {
        headers: { Authorization: key },
        next: { revalidate: 3600 }
      });
      if (!res.ok) throw new Error(`Player details error: ${res.status}`);
      return res.json();
    });

    return NextResponse.json(player);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
