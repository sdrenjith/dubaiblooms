import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiEye, FiEyeOff } from 'react-icons/fi';
import { articlesAPI } from '@/services/api';
import { formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';
import type { Article } from '@/types';

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const { data } = await articlesAPI.getAllAdmin({ page, limit: 15 });
      setArticles(data.data);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, [page]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await articlesAPI.delete(id);
      toast.success('Article deleted');
      fetchArticles();
    } catch (error) {
      toast.error('Failed to delete article');
    }
  };

  const togglePublished = async (article: Article) => {
    try {
      await articlesAPI.update(article._id, { isPublished: !article.isPublished });
      toast.success(article.isPublished ? 'Article unpublished' : 'Article published');
      fetchArticles();
    } catch (error) {
      toast.error('Failed to update article');
    }
  };

  const toggleFeatured = async (article: Article) => {
    try {
      await articlesAPI.update(article._id, { isFeatured: !article.isFeatured });
      toast.success(article.isFeatured ? 'Removed from featured' : 'Marked as featured');
      fetchArticles();
    } catch (error) {
      toast.error('Failed to update article');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary">Articles</h1>
          <p className="text-text-muted text-sm mt-1">Manage your content</p>
        </div>
        <Link to="/admin/articles/new" className="btn-primary justify-center">
          <FiPlus size={18} /> New Article
        </Link>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Article</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="text-center p-3 sm:p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="text-right p-3 sm:p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article._id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={article.featuredImage.startsWith('http') ? article.featuredImage : article.featuredImage}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate max-w-xs">{article.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">{article.views} views</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 hidden md:table-cell">
                      <span className="text-xs text-text-secondary">{article.category?.name}</span>
                    </td>
                    <td className="p-3 sm:p-4 hidden lg:table-cell">
                      <span className="text-xs text-text-muted">{formatDate(article.createdAt)}</span>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-semibold
                          ${article.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {article.isPublished ? 'Live' : 'Draft'}
                        </span>
                        {article.isFeatured && (
                          <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-primary/20 text-primary">
                            ★
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleFeatured(article)} title="Toggle featured"
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${article.isFeatured ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>
                          <FiStar size={14} />
                        </button>
                        <button onClick={() => togglePublished(article)} title="Toggle publish"
                          className="p-2 rounded-lg text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                          {article.isPublished ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                        </button>
                        <Link to={`/admin/articles/${article._id}`}
                          className="p-2 rounded-lg text-text-muted hover:text-blue-400 transition-colors">
                          <FiEdit2 size={14} />
                        </Link>
                        <button onClick={() => handleDelete(article._id, article.title)}
                          className="p-2 rounded-lg text-text-muted hover:text-red-400 transition-colors cursor-pointer">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 p-4 border-t border-border">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer
                  ${p === page ? 'gradient-bg text-white' : 'text-text-muted hover:text-text-primary'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesPage;
