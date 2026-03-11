import { NextResponse } from 'next/server';

async function check(url: string, init?: RequestInit) {
  try {
    const res = await fetch(url, init);
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

export async function GET() {
  const [espn, teams] = await Promise.all([
    check('https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'),
    check('https://api.balldontlie.io/v1/teams', {
      headers: process.env.BALLDONTLIE_API_KEY ? { Authorization: process.env.BALLDONTLIE_API_KEY } : undefined
    })
  ]);

  const oddsConfigured = Boolean(process.env.ODDS_API_KEY);

  return NextResponse.json({
    apiStatus: {
      espn,
      balldontlie: teams,
      oddsConfigured
    },
    checkedAt: new Date().toISOString()
  });
}
