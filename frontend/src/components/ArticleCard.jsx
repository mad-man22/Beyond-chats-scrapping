import React from 'react';
import { Calendar, ExternalLink, ArrowRight } from 'lucide-react';

const ArticleCard = ({ article, onClick }) => {
    // Check if it's an optimized version (dummy check based on URL or title)
    const isOptimized = article.link.includes('/optimized/');

    return (
        <div
            onClick={() => onClick(article)}
            className="glass group relative flex flex-col overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
        >
            {isOptimized && (
                <div className="absolute top-4 right-4 z-10 rounded-full bg-primary-500/20 px-3 py-1 text-xs font-semibold text-primary-400 backdrop-blur-md border border-primary-500/30">
                    AI Optimized
                </div>
            )}

            <div className="mb-4 flex items-center space-x-2 text-xs text-slate-400">
                <Calendar className="h-3 w-3" />
                <span>{article.date}</span>
            </div>

            <h3 className="mb-3 text-xl font-bold text-white transition-colors group-hover:text-primary-400 line-clamp-2">
                {article.title}
            </h3>

            <p className="mb-6 text-sm text-slate-400 line-clamp-3">
                {article.excerpt.replace(/#+\s*/, '').substring(0, 150)}...
            </p>

            <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center text-sm font-medium text-primary-400 group-hover:underline">
                    Read More <ArrowRight className="ml-1 h-4 w-4" />
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); window.open(article.link, '_blank'); }}
                    className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                    <ExternalLink className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default ArticleCard;
