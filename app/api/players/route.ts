import { NextResponse } from 'next/server';
import { getEnrichedPlayers } from '@/lib/data';

export async function GET() {
  const players = await getEnrichedPlayers();
  return NextResponse.json({ players });
}
