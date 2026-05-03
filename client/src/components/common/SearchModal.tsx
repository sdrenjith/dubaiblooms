import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import { articlesAPI } from '@/services/api';
import { getImageUrl, formatDate } from '@/utils/helpers';
import type { Article } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        try {
          const { data } = await articlesAPI.search(query);
          setResults(data.data);
        } catch { setResults([]); }
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh] sm:pt-[12vh]"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl" />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 border-b border-border">
              <FiSearch className="text-text-muted text-xl shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                className="flex-1 bg-transparent text-lg text-text-primary placeholder-text-muted outline-none font-body"
              />
              <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                <FiX size={20} />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-3 sm:p-4">
              {isSearching && (
                <div className="p-10 text-center text-text-muted font-accent text-sm tracking-wide">Searching...</div>
              )}
              {!isSearching && query.length >= 2 && results.length === 0 && (
                <div className="p-10 text-center text-text-muted">No articles found for "{query}"</div>
              )}
              {results.map((article) => (
                <Link
                  key={article._id}
                  to={`/${article.category?.slug || 'uncategorized'}/${article.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 sm:gap-5 p-3 sm:p-4 rounded-2xl hover:bg-surface-elevated transition-colors"
                >
                  <img
                    src={getImageUrl(article.featuredImage)}
                    alt={article.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-heading font-semibold text-[15px] text-text-primary line-clamp-1">
                      {article.title}
                    </h4>
                    <p className="text-xs text-text-muted mt-1 line-clamp-1">{article.excerpt}</p>
                    <span className="section-label mt-1.5 inline-block text-[9px]">
                      {article.category?.name} · {formatDate(article.publishedAt)}
                    </span>
                  </div>
                </Link>
              ))}
              {query.length < 2 && (
                <div className="p-10 text-center text-text-muted text-sm">
                  <p className="font-accent text-xs uppercase tracking-widest mb-1">Search</p>
                  <p>Type at least 2 characters</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
