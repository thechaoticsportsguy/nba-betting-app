import Link from 'next/link';

const links = [
  { href: '/', label: 'Games' },
  { href: '/teams', label: 'Teams' },
  { href: '/betting', label: 'Betting' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="text-court">NBA</span>
          <span>Live Hub</span>
        </Link>

        <ul className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="transition hover:text-court">{l.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
