import { NextResponse } from 'next/server';
import playersData from '@/data/players.json';
import teamsData from '@/data/teams.json';
import { BDL_TEAM_IDS, TEAM_META } from '@/lib/bdlTeamIds';

const BDL_KEY = process.env.BALLDONTLIE_API_KEY;
const BDL_BASE = 'https://api.balldontlie.io/v1';

// Get local team + players from our JSON files (always works, no API key needed)
function getLocalTeamData(abbrev: string) {
  const aUpper = abbrev.toUpperCase();
  const team = (teamsData as any[]).find(
    (t) => t.id?.toLowerCase() === abbrev.toLowerCase() || t.abbreviation?.toUpperCase() === aUpper
  );
  const players = (playersData as any[]).filter(
    (p) => p.teamId?.toLowerCase() === abbrev.toLowerCase()
  );
  const meta = TEAM_META[aUpper] ?? { conference: 'Unknown', division: 'Unknown' };
  return { team, players, meta };
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const rawId = params.id; // could be 'atl', 'bos', or a numeric string
  const abbrev = rawId.length <= 4 ? rawId.toUpperCase() : null;
  const bdlId = abbrev ? BDL_TEAM_IDS[abbrev] : parseInt(rawId, 10);

  const { team: localTeam, players: localPlayers, meta } = getLocalTeamData(abbrev ?? rawId);

  // Attempt live BallDontLie fetch for richer data (roster + schedule)
  if (BDL_KEY && bdlId) {
    try {
      const [teamRes, rosterRes, gamesRes] = await Promise.allSettled([
        fetch(`${BDL_BASE}/teams/${bdlId}`, {
          headers: { Authorization: BDL_KEY },
          next: { revalidate: 3600 }
        }),
        fetch(`${BDL_BASE}/players/active?team_ids[]=${bdlId}&per_page=50`, {
          headers: { Authorization: BDL_KEY },
          next: { revalidate: 3600 }
        }),
        fetch(
          `${BDL_BASE}/games?team_ids[]=${bdlId}&per_page=10&seasons[]=2024`,
          { headers: { Authorization: BDL_KEY }, next: { revalidate: 900 } }
        )
      ]);

      const bdlTeam = teamRes.status === 'fulfilled' && teamRes.value.ok
        ? (await teamRes.value.json()).data
        : null;
      const bdlRoster = rosterRes.status === 'fulfilled' && rosterRes.value.ok
        ? (await rosterRes.value.json()).data ?? []
        : [];
      const bdlGames = gamesRes.status === 'fulfilled' && gamesRes.value.ok
        ? (await gamesRes.value.json()).data ?? []
        : [];

      if (bdlTeam || bdlRoster.length) {
        return NextResponse.json({
          source: 'balldontlie',
          team: {
            id: rawId,
            abbreviation: abbrev ?? rawId,
            name: bdlTeam?.full_name ?? localTeam?.name ?? abbrev,
            conference: bdlTeam?.conference ?? meta.conference,
            division: bdlTeam?.division ?? meta.division,
          },
          roster: bdlRoster.map((p: any) => ({
            id: p.id,
            name: `${p.first_name} ${p.last_name}`,
            position: p.position ?? '—',
            points: 0,
            rebounds: 0,
            assists: 0,
          })),
          recentGames: bdlGames.map((g: any) => ({
            id: g.id,
            date: g.date,
            homeTeam: g.home_team?.full_name ?? 'Home',
            homeScore: g.home_team_score,
            awayTeam: g.visitor_team?.full_name ?? 'Away',
            awayScore: g.visitor_team_score,
            status: g.status,
          })),
          localPlayers,
        });
      }
    } catch {
      // fall through to local data
    }
  }

  // Local-only fallback (always works without API key)
  return NextResponse.json({
    source: 'local',
    team: {
      id: rawId,
      abbreviation: abbrev ?? rawId,
      name: localTeam?.name ?? rawId,
      conference: meta.conference,
      division: meta.division,
    },
    roster: localPlayers.map((p: any) => ({
      id: p.id,
      name: p.name,
      position: '—',
      points: p.points,
      rebounds: p.rebounds,
      assists: p.assists,
    })),
    recentGames: [],
    localPlayers,
  });
}
