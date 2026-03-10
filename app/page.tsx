import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import FeaturedGameCard from '@/components/FeaturedGameCard';
import LiveGamesSection from '@/components/LiveGamesSection';
import Navbar from '@/components/Navbar';
import NewsCard from '@/components/NewsCard';
import PlayerCard from '@/components/PlayerCard';
import { getEnrichedGames, getEnrichedPlayers, getNews } from '@/lib/data';

export default async function HomePage() {
  const [games, players, news] = await Promise.all([getEnrichedGames(), getEnrichedPlayers(), getNews()]);

  const featuredGame = games.find((game) => game.featured) ?? games[0];

  return (
    <main>
      <Navbar />
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6">
        <BreakingNewsTicker news={news} />

        {featuredGame ? <FeaturedGameCard game={featuredGame} players={players} /> : null}

        <LiveGamesSection initialGames={games} />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Player Highlights</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">NBA News Feed</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {news.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
