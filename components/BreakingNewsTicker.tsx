import { NewsArticle } from '@/lib/types';

export default function BreakingNewsTicker({ news }: { news: NewsArticle[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
      <p className="whitespace-nowrap text-sm text-slate-300">
        <span className="mr-3 font-semibold text-red-400">Breaking:</span>
        {news.map((article) => article.headline).join(' • ')}
      </p>
    </div>
  );
}
