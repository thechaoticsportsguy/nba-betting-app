'use client';

import { useEffect, useState } from 'react';

type BetResult = 'pending' | 'won' | 'lost' | 'push';

type Bet = {
  id: string;
  date: string;
  game: string;
  betType: 'Moneyline' | 'Spread' | 'Over' | 'Under' | 'Player Prop';
  pick: string;
  odds: number;   // American odds, e.g. -110, +150
  stake: number;  // Amount wagered in $
  result: BetResult;
};

const STORAGE_KEY = 'nba-bet-tracker-v1';

// Calculate profit from american odds + stake
function calcProfit(odds: number, stake: number): number {
  if (odds > 0) return (odds / 100) * stake;
  return (100 / Math.abs(odds)) * stake;
}

function toAmerican(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

function ResultBadge({ result }: { result: BetResult }) {
  const cls =
    result === 'won' ? 'bg-emerald-500/20 text-emerald-400' :
    result === 'lost' ? 'bg-rose-500/20 text-rose-400' :
    result === 'push' ? 'bg-slate-600 text-slate-300' :
    'bg-amber-500/20 text-amber-400';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${cls}`}>
      {result.charAt(0).toUpperCase() + result.slice(1)}
    </span>
  );
}

const DEFAULT_FORM = {
  game: '', betType: 'Moneyline' as Bet['betType'],
  pick: '', odds: '-110', stake: '20', result: 'pending' as BetResult,
};

export default function BetTracker() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | BetResult>('all');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setBets(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // Persist on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bets)); } catch { /* ignore */ }
  }, [bets]);

  function addBet() {
    const odds = parseInt(form.odds, 10);
    const stake = parseFloat(form.stake);
    if (!form.game || !form.pick || isNaN(odds) || isNaN(stake) || stake <= 0) return;
    const bet: Bet = {
      id: `${Date.now()}`,
      date: new Date().toLocaleDateString(),
      game: form.game,
      betType: form.betType,
      pick: form.pick,
      odds,
      stake,
      result: form.result,
    };
    setBets((prev) => [bet, ...prev]);
    setForm(DEFAULT_FORM);
    setShowForm(false);
  }

  function updateResult(id: string, result: BetResult) {
    setBets((prev) => prev.map((b) => b.id === id ? { ...b, result } : b));
  }

  function deleteBet(id: string) {
    setBets((prev) => prev.filter((b) => b.id !== id));
  }

  // Stats calculations
  const settled = bets.filter((b) => b.result !== 'pending' && b.result !== 'push');
  const won = settled.filter((b) => b.result === 'won');
  const lost = settled.filter((b) => b.result === 'lost');
  const totalStaked = bets.reduce((s, b) => s + b.stake, 0);
  const netPnL = bets.reduce((s, b) => {
    if (b.result === 'won') return s + calcProfit(b.odds, b.stake);
    if (b.result === 'lost') return s - b.stake;
    return s;
  }, 0);
  const roi = totalStaked > 0 ? (netPnL / totalStaked) * 100 : 0;
  const winRate = settled.length > 0 ? (won.length / settled.length) * 100 : 0;

  const displayed = filter === 'all' ? bets : bets.filter((b) => b.result === filter);

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Record', value: `${won.length}–${lost.length}` },
          { label: 'Win Rate', value: `${winRate.toFixed(0)}%` },
          { label: 'Net P&L', value: `${netPnL >= 0 ? '+' : ''}$${netPnL.toFixed(2)}`, color: netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'ROI', value: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`, color: roi >= 0 ? 'text-emerald-400' : 'text-rose-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className={`mt-1 text-2xl font-extrabold ${s.color ?? 'text-white'}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400"
        >
          + Log Bet
        </button>
        <div className="flex gap-1 rounded-lg border border-slate-800 p-1">
          {(['all', 'pending', 'won', 'lost', 'push'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-3 py-1 text-xs font-semibold transition ${filter === f ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-500">{bets.length} bets · ${totalStaked.toFixed(0)} wagered</span>
      </div>

      {/* Add bet form */}
      {showForm && (
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
          <h3 className="mb-4 font-semibold text-white">Log a Bet</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Game / Matchup</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. Lakers @ Celtics"
                value={form.game}
                onChange={(e) => setForm({ ...form, game: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Bet Type</label>
              <select
                className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-white"
                value={form.betType}
                onChange={(e) => setForm({ ...form, betType: e.target.value as Bet['betType'] })}
              >
                <option>Moneyline</option>
                <option>Spread</option>
                <option>Over</option>
                <option>Under</option>
                <option>Player Prop</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Your Pick</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. Lakers ML / Celtics -4.5"
                value={form.pick}
                onChange={(e) => setForm({ ...form, pick: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">American Odds</label>
              <input
                type="number"
                className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="-110"
                value={form.odds}
                onChange={(e) => setForm({ ...form, odds: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Stake ($)</label>
              <input
                type="number"
                className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="20"
                value={form.stake}
                onChange={(e) => setForm({ ...form, stake: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Result</label>
              <select
                className="w-full rounded-lg border border-slate-700 bg-black px-3 py-2 text-sm text-white"
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value as BetResult })}
              >
                <option value="pending">Pending</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
                <option value="push">Push</option>
              </select>
            </div>
          </div>
          {/* Payout preview */}
          {!isNaN(parseInt(form.odds)) && !isNaN(parseFloat(form.stake)) && parseFloat(form.stake) > 0 && (
            <p className="mt-3 text-xs text-slate-400">
              Potential win: <span className="font-bold text-emerald-400">${calcProfit(parseInt(form.odds), parseFloat(form.stake)).toFixed(2)}</span>
              {' · '}Total return: <span className="font-bold text-white">${(parseFloat(form.stake) + calcProfit(parseInt(form.odds), parseFloat(form.stake))).toFixed(2)}</span>
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              onClick={addBet}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400"
            >
              Save Bet
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(DEFAULT_FORM); }}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bet history */}
      {displayed.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-500">
          No bets logged yet. Click &quot;+ Log Bet&quot; to start tracking.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-sm">
            <thead className="bg-black text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Game</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Pick</th>
                <th className="px-4 py-3 text-right">Odds</th>
                <th className="px-4 py-3 text-right">Stake</th>
                <th className="px-4 py-3 text-right">P&L</th>
                <th className="px-4 py-3 text-left">Result</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {displayed.map((b) => {
                const pnl = b.result === 'won' ? calcProfit(b.odds, b.stake) : b.result === 'lost' ? -b.stake : 0;
                return (
                  <tr key={b.id} className="border-t border-slate-800/50 hover:bg-slate-900/40">
                    <td className="px-4 py-3 text-slate-500">{b.date}</td>
                    <td className="px-4 py-3 text-white">{b.game}</td>
                    <td className="px-4 py-3 text-slate-400">{b.betType}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{b.pick}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${b.odds > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {toAmerican(b.odds)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">${b.stake.toFixed(0)}</td>
                    <td className={`px-4 py-3 text-right font-bold ${pnl > 0 ? 'text-emerald-400' : pnl < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                      {b.result === 'pending' ? '—' : `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded border border-slate-700 bg-slate-900 px-1 py-0.5 text-xs text-slate-300"
                        value={b.result}
                        onChange={(e) => updateResult(b.id, e.target.value as BetResult)}
                      >
                        <option value="pending">Pending</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                        <option value="push">Push</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteBet(b.id)} className="text-slate-600 hover:text-rose-400 text-xs">✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
