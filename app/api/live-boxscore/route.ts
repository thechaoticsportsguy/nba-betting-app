import { NextResponse } from 'next/server';
import { normalizeLiveBoxScores } from '@/lib/balldontlie';

const BALLDONTLIE_BOX_URL = 'https://api.balldontlie.io/v1/box_scores/live';
const BALLDONTLIE_KEY = process.env.BALLDONTLIE_API_KEY ?? '5961d28b-ac82-4980-ba1e-de7454c1511a';

export const revalidate = 12;

export async function GET() {
  try {
    const response = await fetch(BALLDONTLIE_BOX_URL, {
      headers: { Authorization: BALLDONTLIE_KEY },
      next: { revalidate: 12 }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch live box scores' }, { status: 502 });
    }

    const payload = await response.json();
    return NextResponse.json(normalizeLiveBoxScores(payload));
  } catch {
    return NextResponse.json({ error: 'Unexpected error loading box score' }, { status: 500 });
  }
}
