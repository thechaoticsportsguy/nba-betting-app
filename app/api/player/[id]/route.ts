import { NextResponse } from 'next/server';
import { PlayerProfile } from '@/lib/types';

const BALLDONTLIE_KEY = process.env.BALLDONTLIE_API_KEY ?? '5961d28b-ac82-4980-ba1e-de7454c1511a';

export const revalidate = 3600;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`https://api.balldontlie.io/v1/players/${params.id}`, {
      headers: { Authorization: BALLDONTLIE_KEY },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch player' }, { status: 502 });
    }

    const payload = await response.json();
    const p = payload.data ?? payload;
    const player: PlayerProfile = {
      id: Number(p.id ?? 0),
      firstName: p.first_name ?? '',
      lastName: p.last_name ?? '',
      team: p.team?.full_name ?? '',
      position: p.position ?? ''
    };

    return NextResponse.json({ player });
  } catch {
    return NextResponse.json({ error: 'Unexpected error loading player' }, { status: 500 });
  }
}
