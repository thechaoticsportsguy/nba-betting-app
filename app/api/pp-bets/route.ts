import { NextResponse } from 'next/server';
import { withCache } from '@/lib/server/cache';

export async function GET() {
  const apiKey = process.env.PP_API_KEY;
  const apiUrl = process.env.PP_API_URL;

  if (!apiKey || !apiUrl) {
    return NextResponse.json({ props: [], warning: 'Missing PP API configuration' });
  }

  try {
    const props = await withCache('pp-props', 90, async () => {
      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 90 }
      });
      if (!res.ok) throw new Error(`PP API error: ${res.status}`);
      return res.json();
    });

    return NextResponse.json({ props });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
