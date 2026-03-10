'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PlayerStat } from '@/lib/types';

type SortKey = 'name' | 'min' | 'pts' | 'reb' | 'ast' | 'stl' | 'blk' | 'fg_pct' | 'plus_minus';

const toMinutes = (min: string): number => {
  const m = min?.split(':');
  if (!m || m.length !== 2) return 0;
  return Number(m[0]) + Number(m[1]) / 60;
};

export default function LiveBoxScoreTable({ title, players }: { title: string; players: PlayerStat[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('min');
  const [desc, setDesc] = useState(true);

  const sorted = useMemo(() => {
    const copy = [...players];
    copy.sort((a, b) => {
      if (sortKey === 'name') return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      if (sortKey === 'min') return toMinutes(a.min) - toMinutes(b.min);
      return Number(a[sortKey]) - Number(b[sortKey]);
    });
    return desc ? copy.reverse() : copy;
  }, [players, sortKey, desc]);

  const setSort = (k: SortKey) => {
    if (sortKey === k) setDesc((v) => !v);
    else {
      setSortKey(k);
      setDesc(true);
    }
  };

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-700">{title}</h3>
      <div className="max-h-64 overflow-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-xs">
          <thead className="sticky top-0 bg-slate-100">
            <tr>
              <th className="cursor-pointer px-2 py-2 text-left" onClick={() => setSort('name')}>Player</th>
              <th className="cursor-pointer px-2 py-2 text-left" onClick={() => setSort('min')}>MIN</th>
              <th className="cursor-pointer px-2 py-2 text-left" onClick={() => setSort('pts')}>PTS</th>
              <th className="cursor-pointer px-2 py-2 text-left" onClick={() => setSort('reb')}>REB</th>
              <th className="cursor-pointer px-2 py-2 text-left" onClick={() => setSort('ast')}>AST</th>
              <th className="cursor-pointer px-2 py-2 text-left" onClick={() => setSort('stl')}>STL</th>
              <th className="cursor-pointer px-2 py-2 text-left" onClick={() => setSort('blk')}>BLK</th>
              <th className="cursor-pointer px-2 py-2 text-left" onClick={() => setSort('fg_pct')}>FG%</th>
              <th className="cursor-pointer px-2 py-2 text-left" onClick={() => setSort('plus_minus')}>+/-</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-2 py-1.5">
                  <Link href={`/players/${p.id}`} className="hover:underline">{p.first_name} {p.last_name}</Link>
                </td>
                <td className="px-2 py-1.5">{p.min || '0'}</td>
                <td className="px-2 py-1.5">{p.pts}</td>
                <td className="px-2 py-1.5">{p.reb}</td>
                <td className="px-2 py-1.5">{p.ast}</td>
                <td className="px-2 py-1.5">{p.stl}</td>
                <td className="px-2 py-1.5">{p.blk}</td>
                <td className="px-2 py-1.5">{(p.fg_pct * 100).toFixed(1)}%</td>
                <td className="px-2 py-1.5">{p.plus_minus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
