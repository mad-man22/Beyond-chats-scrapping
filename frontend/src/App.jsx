import React, { useState } from 'react';
import { useArticles } from './hooks/useArticles';
import ArticleCard from './components/ArticleCard';
import ArticleDetail from './components/ArticleDetail';
import { RefreshCw, LayoutGrid, Search, Sparkles, Database } from 'lucide-react';

function App() {
  const { articles, loading, error, refresh, triggerScrape } = useArticles();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScraping, setIsScraping] = useState(false);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScrape = async () => {
    setIsScraping(true);
    const result = await triggerScrape();
    setIsScraping(false);
    if (result.success) {
      alert('Scraping completed successfully!');
    } else {
      alert(`Scraping failed: ${result.error}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-200 selection:bg-primary-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Beyond<span className="text-primary-500">Chats</span> <span className="text-sm font-medium text-slate-500 uppercase tracking-widest ml-1">Insights</span>
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleScrape}
              disabled={isScraping}
              className={`flex items-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition-all hover:bg-white/10 active:scale-95 ${isScraping ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Database className={`h-4 w-4 ${isScraping ? 'animate-pulse' : ''}`} />
              <span>{isScraping ? 'Scraping...' : 'Trigger Scrape'}</span>
            </button>
            <button
              onClick={refresh}
              className="p-2 text-slate-400 transition-colors hover:text-white"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Explore <span className="gradient-text">Latest Articles</span>
            </h2>
            <p className="mt-2 text-slate-400">Discover insights, guides, and updates from the world of AI chatbots.</p>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-slate-600 shadow-inner"
            />
          </div>
        </div>

        {/* Content Area */}
        {loading && !articles.length ? (
          <div className="flex h-64 w-full items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="h-10 w-10 animate-spin text-primary-500" />
              <p className="text-slate-500 font-medium">Fetching articles...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass rounded-3xl border-red-500/20 bg-red-500/5 p-12 text-center">
            <p className="text-lg text-red-400 font-semibold">{error}</p>
            <button
              onClick={refresh}
              className="mt-4 rounded-xl bg-red-500 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="glass rounded-3xl p-24 text-center">
            <LayoutGrid className="mx-auto h-12 w-12 text-slate-700" />
            <h3 className="mt-4 text-xl font-bold text-white">No articles found</h3>
            <p className="mt-2 text-slate-500">Try adjusting your search or trigger a new scrape.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={setSelectedArticle}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      <ArticleDetail
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      {/* Mobile Actions */}
      <div className="fixed bottom-8 right-8 z-40 md:hidden">
        <button
          onClick={handleScrape}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-2xl shadow-primary-500/50 hover:bg-primary-500 active:scale-95"
        >
          <Database className={`h-6 w-6 ${isScraping ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      <footer className="mt-24 border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          <p>© 2025 BeyondChats Insights. Empowering communication with AI.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
