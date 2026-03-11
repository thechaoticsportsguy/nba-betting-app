import { NextResponse } from 'next/server';
import { withCache } from '@/lib/server/cache';

export async function GET() {
  const key = process.env.BALLDONTLIE_API_KEY;
  if (!key) return NextResponse.json({ data: [], warning: 'Missing BALLDONTLIE_API_KEY' });

  try {
    const boxScores = await withCache('live-box-scores', 20, async () => {
      const res = await fetch('https://api.balldontlie.io/v1/box_scores/live', {
        headers: { Authorization: key },
        next: { revalidate: 20 }
      });
      if (!res.ok) throw new Error(`BallDontLie live box scores error: ${res.status}`);
      return res.json();
    });

    return NextResponse.json(boxScores);
  } catch (error) {
    return NextResponse.json({ data: [], error: (error as Error).message }, { status: 500 });
  }
}
