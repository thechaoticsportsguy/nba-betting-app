import { PlayerAnalysisResponse } from '@/lib/types';

const Card = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-md">
    <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
    <p className="mt-2 text-lg font-semibold">{value}</p>
    {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
  </div>
);

export default function AnalysisSummaryCards({ data }: { data: PlayerAnalysisResponse }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card title="Best Points Edge" value={data.summary.bestPointsEdge ? `${data.summary.bestPointsEdge.playerName} (${data.summary.bestPointsEdge.edge})` : 'N/A'} />
      <Card title="Best Rebounds Edge" value={data.summary.bestReboundsEdge ? `${data.summary.bestReboundsEdge.playerName} (${data.summary.bestReboundsEdge.edge})` : 'N/A'} />
      <Card title="Best Assists Edge" value={data.summary.bestAssistsEdge ? `${data.summary.bestAssistsEdge.playerName} (${data.summary.bestAssistsEdge.edge})` : 'N/A'} />
      <Card title="Best Overall Value" value={data.summary.bestOverallValue ? `${data.summary.bestOverallValue.playerName} (${data.summary.bestOverallValue.edge})` : 'N/A'} subtitle={data.source === 'odds+stats' ? 'Live odds + stats' : 'Stats fallback'} />
    </section>
  );
}
