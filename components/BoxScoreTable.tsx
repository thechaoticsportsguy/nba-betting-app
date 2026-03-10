'use client';

import { useMemo, useState } from 'react';
import { BoxScorePlayer } from '@/lib/types';

type SortKey = 'playerName' | 'minutes' | 'points' | 'rebounds' | 'assists' | 'steals' | 'blocks' | 'fgPct' | 'plusMinus';

export default function BoxScoreTable({ title, players }: { title: string; players: BoxScorePlayer[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('points');
  const [desc, setDesc] = useState(true);

  const sorted = useMemo(() => {
    const copy = [...players];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' || typeof bv === 'string') {
        return String(av).localeCompare(String(bv));
      }
      return Number(av) - Number(bv);
    });
    return desc ? copy.reverse() : copy;
  }, [players, sortKey, desc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setDesc((d) => !d);
      return;
    }
    setSortKey(key);
    setDesc(true);
  };

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-700">{title}</h3>
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              {['Player', 'MIN', 'PTS', 'REB', 'AST', 'STL', 'BLK', 'FG%', '+/-'].map((label, idx) => {
                const keyMap: SortKey[] = ['playerName', 'minutes', 'points', 'rebounds', 'assists', 'steals', 'blocks', 'fgPct', 'plusMinus'];
                const key = keyMap[idx];
                return (
                  <th key={label} onClick={() => handleSort(key)} className="cursor-pointer px-2 py-2 text-left">
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={`${p.playerId}-${p.teamId}`} className="border-t border-slate-100">
                <td className="px-2 py-1.5">{p.playerName}</td>
                <td className="px-2 py-1.5">{p.minutes}</td>
                <td className="px-2 py-1.5">{p.points}</td>
                <td className="px-2 py-1.5">{p.rebounds}</td>
                <td className="px-2 py-1.5">{p.assists}</td>
                <td className="px-2 py-1.5">{p.steals}</td>
                <td className="px-2 py-1.5">{p.blocks}</td>
                <td className="px-2 py-1.5">{(p.fgPct * 100).toFixed(1)}%</td>
                <td className="px-2 py-1.5">{p.plusMinus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
