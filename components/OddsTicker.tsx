import { toAmericanOdds } from '@/lib/server/time';

export default function OddsTicker({ odds }: { odds: any[] }) {
  const top = odds.slice(0, 8);
  return (
    <div className="overflow-hidden rounded-xl border bg-slate-900 py-2 text-white">
      <div className="animate-[ticker_35s_linear_infinite] whitespace-nowrap px-4 text-sm">
        {top.map((game) => {
          const h2h = game.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'h2h');
          const outcomes = h2h?.outcomes ?? [];
          return (
            <span key={game.id} className="mr-10 inline-flex gap-2">
              <strong>{game.awayTeam} @ {game.homeTeam}</strong>
              {outcomes.map((o: any) => (
                <span key={o.name}>{o.name} {toAmericanOdds(o.price)}</span>
              ))}
            </span>
          );
        })}
      </div>
    </div>
  );
}
