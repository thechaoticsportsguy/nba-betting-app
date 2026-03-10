import { NextResponse } from 'next/server';
import { getEnrichedGames } from '@/lib/data';

export async function GET() {
  const games = await getEnrichedGames();
  return NextResponse.json({ games });
}
