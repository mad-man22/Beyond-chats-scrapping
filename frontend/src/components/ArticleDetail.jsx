import React from 'react';
import { X, Calendar, Globe, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

const ArticleDetail = ({ article, isOpen, onClose }) => {
    if (!isOpen || !article) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="glass relative z-10 flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 p-6">
                        <div className="flex flex-col">
                            <span className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary-400">
                                {article.link.includes('/optimized/') ? 'Optimized Article' : 'Source Article'}
                            </span>
                            <h2 className="text-2xl font-bold text-white leading-tight">
                                {article.title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
                        <div className="mb-8 flex items-center space-x-6 text-sm text-slate-400">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>{article.date}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Globe className="h-4 w-4" />
                                <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 underline decoration-primary-500/30">
                                    Original Source
                                </a>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none text-slate-300">
                            <ReactMarkdown
                                components={{
                                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-white mt-8 mb-4 border-b border-white/5 pb-2" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-white mt-6 mb-3" {...props} />,
                                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 pl-4" {...props} />,
                                    li: ({ node, ...props }) => <li className="text-slate-300" {...props} />,
                                    code: ({ node, ...props }) => <code className="bg-slate-800 rounded px-1 py-0.5 text-pink-400 font-mono text-sm" {...props} />,
                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary-500/50 bg-white/5 p-4 rounded-r italic my-4" {...props} />,
                                }}
                            >
                                {article.excerpt}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end border-t border-white/10 p-6 space-x-3">
                        <button
                            onClick={() => window.open(article.link, '_blank')}
                            className="inline-flex items-center rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-500 active:scale-95"
                        >
                            View Live <Share2 className="ml-2 h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ArticleDetail;
