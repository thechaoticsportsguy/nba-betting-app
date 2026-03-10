import { NewsArticle } from '@/lib/types';

export default function NewsCard({ article }: { article: NewsArticle }) {
  const published = new Date(article.publishedAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <article className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <img src={article.articleImage} alt={article.headline} className="h-32 w-full object-cover" />
      <div className="space-y-2 p-4">
        <span className="inline-flex rounded bg-slate-800 px-2 py-1 text-xs text-court">{article.teamTag}</span>
        <h3 className="font-semibold leading-snug">{article.headline}</h3>
        <p className="text-sm text-slate-400">{article.description}</p>
        <p className="text-xs text-slate-500">{published}</p>
      </div>
    </article>
  );
}
