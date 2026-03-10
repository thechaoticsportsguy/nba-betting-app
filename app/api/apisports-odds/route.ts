import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';

const CACHE_KEY = 'apisports-odds';
const TTL = 15 * 60 * 1000; // 15 min – free plan = 100 req/day

export async function GET() {
  const apiKey = process.env.APISPORTS_KEY;

  if (!apiKey) {
    return NextResponse.json({ odds: [], warning: 'APISPORTS_KEY not set' });
  }

  try {
    const cached = getCached<unknown[]>(CACHE_KEY);
    if (cached) return NextResponse.json({ odds: cached });

    const res = await fetch('https://v1.basketball.api-sports.io/odds?league=12&season=2025-2026', {
      headers: { 'x-apisports-key': apiKey },
      next: { revalidate: 900 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'API-SPORTS error' }, { status: 502 });
    }

    const json = await res.json();
    const odds = json.response ?? [];

    setCache(CACHE_KEY, odds, TTL);
    return NextResponse.json({ odds });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch API-SPORTS odds' }, { status: 500 });
  }
}
