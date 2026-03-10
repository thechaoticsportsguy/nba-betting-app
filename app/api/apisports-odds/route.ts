import { NextResponse } from 'next/server';
import { withCache } from '@/lib/server/cache';

export async function GET() {
  const apiKey = process.env.APISPORTS_KEY;
  if (!apiKey) return NextResponse.json({ odds: [], warning: 'Missing APISPORTS_KEY' });

  try {
    const data = await withCache('apisports-odds', 1800, async () => {
      const res = await fetch('https://api-basketball.p.rapidapi.com/odds', {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'api-basketball.p.rapidapi.com'
        },
        next: { revalidate: 1800 }
      });
      if (!res.ok) throw new Error(`API-SPORTS error: ${res.status}`);
      return res.json();
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
