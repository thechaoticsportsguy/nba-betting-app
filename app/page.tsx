import Link from 'next/link';
import Navbar from '@/components/Navbar';
import HomeControlCenter from '@/components/HomeControlCenter';

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">NBA Betting Hub</h1>
          <p className="text-slate-600">Cleaner navigation, API health checks, and one-click access to betting + team intel.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/betting" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300">
            <p className="text-sm text-slate-500">Live odds + player models</p>
            <p className="text-lg font-semibold">Betting Dashboard →</p>
          </Link>
          <Link href="/teams" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300">
            <p className="text-sm text-slate-500">Roster and matchup pages</p>
            <p className="text-lg font-semibold">Teams Explorer →</p>
          </Link>
          <a href="/api/live-games" target="_blank" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300">
            <p className="text-sm text-slate-500">Raw JSON endpoints</p>
            <p className="text-lg font-semibold">Open Live Games API →</p>
          </a>
        </div>

        <HomeControlCenter />
      </section>
    </main>
  );
}
