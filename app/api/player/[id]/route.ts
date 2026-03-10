import { NextResponse } from 'next/server';
import { normalizePlayerProfile } from '@/lib/balldontlie';

const BALLDONTLIE_KEY = process.env.BALLDONTLIE_API_KEY;
const BALLDONTLIE_KEY = process.env.BALLDONTLIE_API_KEY ?? '5961d28b-ac82-4980-ba1e-de7454c1511a';

export const revalidate = 3600;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!BALLDONTLIE_KEY) {
    return NextResponse.json({ error: 'BALLDONTLIE_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.balldontlie.io/v1/players/${params.id}`, {
      headers: { Authorization: BALLDONTLIE_KEY },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch player' }, { status: 502 });
    }

    const payload = await response.json();
    return NextResponse.json({ player: normalizePlayerProfile(payload) });
  } catch {
    return NextResponse.json({ error: 'Unexpected error loading player' }, { status: 500 });
  }
}
