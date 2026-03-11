import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-500">Live NBA Data</div>
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white">NBA Betting Hub</h1>
        <p className="mb-8 max-w-xl text-lg text-slate-400">
          Real-time scores, player props, live odds from top sportsbooks, and full team rosters — all in one place.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/betting"
            className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
          >
            Open Betting Dashboard
          </Link>
          <Link
            href="/teams"
            className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            View Teams
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {([
            { label: 'Live Games', value: 'ESPN Feed', desc: 'Real-time scores' },
            { label: 'Betting Odds', value: 'The Odds API', desc: 'ML · Spread · Total' },
            { label: 'Player Props', value: '4 Markets', desc: 'PTS · REB · AST · 3PM' },
            { label: 'Roster', value: '75+ Players', desc: 'All 30 teams' },
          ] as const).map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-xs text-slate-500">{s.label}</div>
              <div className="mt-1 text-lg font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
