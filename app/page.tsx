import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-5xl space-y-4 px-4 py-8">
        <h1 className="text-3xl font-bold">NBA Betting Hub</h1>
        <p className="text-slate-600">Live game data, team pages, and betting tools ready for Vercel deployment.</p>
        <div className="flex gap-3">
          <Link href="/teams" className="rounded bg-slate-900 px-4 py-2 text-white">View Teams</Link>
          <Link href="/betting" className="rounded border border-slate-300 px-4 py-2">Open Betting Dashboard</Link>
        </div>
      </section>
    </main>
  );
}
