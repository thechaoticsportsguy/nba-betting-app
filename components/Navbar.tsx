export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span className="text-court">🏀</span>
          <span>NBA Live Hub</span>
        </div>

        <ul className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <li>Games</li>
          <li>Teams</li>
          <li>Players</li>
          <li>News</li>
        </ul>

        <input
          type="search"
          placeholder="Search teams or players"
          className="w-44 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-court focus:ring md:w-64"
        />
      </nav>
    </header>
  );
}
