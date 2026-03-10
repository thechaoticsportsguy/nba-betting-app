import { NextResponse } from 'next/server';
import { withCache } from '@/lib/server/cache';

export async function GET(_: Request, { params }: { params: { gameId: string } }) {
  try {
    const summary = await withCache(`espn-summary-${params.gameId}`, 30, async () => {
      const res = await fetch(
        `https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${params.gameId}`,
        { next: { revalidate: 30 } }
      );
      if (!res.ok) throw new Error(`ESPN summary error: ${res.status}`);
      return res.json();
    });

    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
