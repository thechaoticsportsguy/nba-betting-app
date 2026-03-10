import { ESPNGame } from '@/lib/types';

const formatStart = (iso: string): string => {
  if (!iso) return 'TBD';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

export default function ScoreStatus({ game }: { game: ESPNGame }) {
  return (
    <div className="text-xs text-slate-400">
      {game.isLive ? (
        <p className="font-medium text-emerald-300">Q{game.period} • {game.clock || 'Live'}</p>
      ) : (
        <p>{formatStart(game.startTime)}</p>
      )}
      <p className="mt-0.5">{game.status}</p>
    </div>
  );
}
