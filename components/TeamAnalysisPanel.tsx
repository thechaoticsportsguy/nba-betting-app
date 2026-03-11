'use client';

import { useState } from 'react';

type AnalysisResult = {
  headline?: string;
  homeAdvantage?: string;
  form?: string;
  keyMatchup?: string;
  bettingAngle?: string;
  confidence?: number;
  recommendation?: string;
  factors?: string[];
  error?: string;
};

type Props = {
  team: { name: string; abbreviation?: string };
  liveGame?: {
    homeTeam: { name: string; abbreviation?: string; score?: number };
    awayTeam: { name: string; abbreviation?: string; score?: number };
  } | null;
};

const CONFIDENCE_COLOR = (n: number) =>
  n >= 7 ? 'text-emerald-400' : n >= 5 ? 'text-amber-400' : 'text-rose-400';

const REC_COLOR = (r: string) =>
  r?.includes('Strong') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300';

export default function TeamAnalysisPanel({ team, liveGame }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Determine opponent for the AI analysis
  const homeTeam = liveGame?.homeTeam?.name ?? team.name;
  const awayTeam = liveGame?.awayTeam?.name ?? 'TBD';
  const isCurrentTeamHome = homeTeam.toLowerCase().includes(team.name.toLowerCase().split(' ').pop() ?? '');

  async function runAnalysis() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/analyze-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeTeam, awayTeam }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: 'Failed to fetch analysis.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <h2 className="mb-3 text-lg font-bold text-white">AI Game Analysis</h2>

      {liveGame ? (
        <p className="mb-3 text-xs text-slate-400">
          {awayTeam} @ {homeTeam}
        </p>
      ) : (
        <p className="mb-3 text-xs text-slate-500">
          No game scheduled today for this team. Analysis will use general team data.
        </p>
      )}

      <button
        onClick={runAnalysis}
        disabled={loading}
        className="w-full rounded-lg bg-orange-500 py-2 text-sm font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Run AI Analysis'}
      </button>

      {loading && (
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-3 animate-pulse rounded bg-slate-800" style={{ width: `${70 + i * 8}%` }} />
          ))}
        </div>
      )}

      {result && !loading && (
        <div className="mt-4 space-y-3 text-sm">
          {result.error ? (
            <p className="text-rose-400">{result.error}</p>
          ) : (
            <>
              {result.headline && (
                <p className="font-semibold text-white">{result.headline}</p>
              )}

              {result.recommendation && (
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${REC_COLOR(result.recommendation)}`}>
                    {result.recommendation}
                  </span>
                  {result.confidence != null && (
                    <span className={`font-bold ${CONFIDENCE_COLOR(result.confidence)}`}>
                      Confidence: {result.confidence}/10
                    </span>
                  )}
                </div>
              )}

              {result.bettingAngle && (
                <div className="rounded-lg bg-slate-900 p-3">
                  <p className="text-xs font-semibold uppercase text-orange-400">Betting Angle</p>
                  <p className="mt-1 text-slate-300">{result.bettingAngle}</p>
                </div>
              )}

              {result.form && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Recent Form</p>
                  <p className="mt-0.5 text-slate-300">{result.form}</p>
                </div>
              )}

              {result.keyMatchup && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Key Matchup</p>
                  <p className="mt-0.5 text-slate-300">{result.keyMatchup}</p>
                </div>
              )}

              {result.factors && result.factors.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Factors</p>
                  <ul className="space-y-1">
                    {result.factors.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-slate-400">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
