import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import playersData from '@/data/players.json';

// Only call Claude from the server — never expose API key to the browser
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { homeTeam, awayTeam, homeOdds, awayOdds, spread, total, gameTime } = body as {
      homeTeam: string;
      awayTeam: string;
      homeOdds?: number | null;
      awayOdds?: number | null;
      spread?: number | null;
      total?: number | null;
      gameTime?: string;
    };

    if (!homeTeam || !awayTeam) {
      return NextResponse.json({ error: 'homeTeam and awayTeam are required' }, { status: 400 });
    }

    // Pull stat context from local player data for both teams
    const allPlayers = playersData as Array<{ name: string; points: number; rebounds: number; assists: number; teamId: string }>;
    const getTeamStats = (abbrev: string) => {
      const roster = allPlayers.filter((p) => p.teamId.toUpperCase() === abbrev.toUpperCase());
      if (!roster.length) return null;
      const topScorer = roster.sort((a, b) => b.points - a.points)[0];
      const avgPts = roster.reduce((s, p) => s + p.points, 0) / roster.length;
      return { topScorer: topScorer.name, topPts: topScorer.points, avgTeamPts: avgPts.toFixed(1), rosterSize: roster.length };
    };

    // Build a name→abbreviation lookup from team names in the odds API format
    const homeAbbrev = homeTeam.split(' ').pop() ?? homeTeam;
    const awayAbbrev = awayTeam.split(' ').pop() ?? awayTeam;
    const homeStats = getTeamStats(homeAbbrev) ?? getTeamStats(homeTeam.substring(0, 3).toUpperCase());
    const awayStats = getTeamStats(awayAbbrev) ?? getTeamStats(awayTeam.substring(0, 3).toUpperCase());

    const oddsContext = [
      homeOdds != null ? `${homeTeam} moneyline: ${homeOdds > 0 ? '+' : ''}${homeOdds}` : null,
      awayOdds != null ? `${awayTeam} moneyline: ${awayOdds > 0 ? '+' : ''}${awayOdds}` : null,
      spread != null ? `Spread: ${spread > 0 ? '+' : ''}${spread}` : null,
      total != null ? `Over/Under: ${total}` : null,
    ].filter(Boolean).join(' | ');

    const statsContext = [
      homeStats ? `${homeTeam}: top scorer ${homeStats.topScorer} (${homeStats.topPts} PPG), team avg ${homeStats.avgTeamPts} PPG` : null,
      awayStats ? `${awayTeam}: top scorer ${awayStats.topScorer} (${awayStats.topPts} PPG), team avg ${awayStats.avgTeamPts} PPG` : null,
    ].filter(Boolean).join(' | ');

    const prompt = `You are an expert NBA betting analyst. Analyze this matchup and provide a concise betting assessment.

GAME: ${awayTeam} @ ${homeTeam}${gameTime ? ` (${gameTime})` : ''}
${oddsContext ? `ODDS: ${oddsContext}` : ''}
${statsContext ? `STATS: ${statsContext}` : ''}

Provide a JSON response with these exact fields:
{
  "headline": "one sentence summary of this matchup",
  "homeAdvantage": "brief note on home court factors",
  "form": "brief assessment of both teams' recent form",
  "keyMatchup": "one player or style matchup to watch",
  "bettingAngle": "specific betting recommendation with reasoning",
  "confidence": <number 1-10>,
  "recommendation": "Strong Home" | "Lean Home" | "Lean Away" | "Strong Away" | "Pass",
  "factors": ["factor1", "factor2", "factor3"]
}

Respond ONLY with valid JSON, no markdown fences.`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    // Parse the response text as JSON
    const text = (message.content[0] as { type: string; text: string }).text.trim();
    let analysis: Record<string, unknown>;
    try {
      analysis = JSON.parse(text);
    } catch {
      // Claude occasionally wraps in backticks — strip them
      const cleaned = text.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim();
      analysis = JSON.parse(cleaned);
    }

    return NextResponse.json({ game: `${awayTeam} @ ${homeTeam}`, ...analysis });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Analysis failed: ${msg}` }, { status: 500 });
  }
}
