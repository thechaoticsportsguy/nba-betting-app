import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';
import type { PPBet } from '@/lib/types';

const CACHE_KEY = 'pp-bets';
const TTL = 5 * 60 * 1000;

export async function GET() {
  const apiKey = process.env.PP_API_KEY;
  const apiUrl = process.env.PP_API_URL;

  if (!apiKey || !apiUrl) {
    return NextResponse.json({ bets: [], warning: 'PP_API_KEY or PP_API_URL not set' });
  }

  try {
    const cached = getCached<PPBet[]>(CACHE_KEY);
    if (cached) return NextResponse.json({ bets: cached });

    const res = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'PP API error' }, { status: 502 });
    }

    const bets: PPBet[] = await res.json();
    setCache(CACHE_KEY, bets, TTL);
    return NextResponse.json({ bets });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch PP bets' }, { status: 500 });
  }
}
