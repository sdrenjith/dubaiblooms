import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFileText, FiFolder, FiEye, FiStar, FiTrendingUp, FiPlus } from 'react-icons/fi';
import { articlesAPI } from '@/services/api';
import { formatDate } from '@/utils/helpers';
import type { DashboardStats } from '@/types';

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await articlesAPI.getStats();
        setStats(data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Articles', value: stats?.stats.totalArticles || 0, icon: FiFileText, color: 'from-blue-500/20 to-blue-600/20 border-blue-500/20' },
    { label: 'Published', value: stats?.stats.publishedArticles || 0, icon: FiTrendingUp, color: 'from-green-500/20 to-green-600/20 border-green-500/20' },
    { label: 'Featured', value: stats?.stats.featuredArticles || 0, icon: FiStar, color: 'from-primary/20 to-amber-600/20 border-primary/20' },
    { label: 'Categories', value: stats?.stats.totalCategories || 0, icon: FiFolder, color: 'from-purple-500/20 to-purple-600/20 border-purple-500/20' },
    { label: 'Total Views', value: stats?.stats.totalViews || 0, icon: FiEye, color: 'from-pink-500/20 to-pink-600/20 border-pink-500/20' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Overview of your editorial platform</p>
        </div>
        <Link to="/admin/articles/new" className="btn-primary justify-center">
          <FiPlus size={18} />
          New Article
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 mb-8 sm:mb-10">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${card.color} border backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon className="text-text-secondary" size={20} />
            </div>
            <p className="font-heading font-bold text-2xl text-text-primary">
              {card.value.toLocaleString()}
            </p>
            <p className="text-text-muted text-xs mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-4 sm:p-6">
        <h2 className="font-heading font-bold text-lg text-text-primary mb-4 sm:mb-5">Recent Articles</h2>
        <div className="space-y-3 sm:space-y-4">
          {stats?.recentArticles.map((article) => (
            <div key={article._id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 sm:p-4 rounded-xl hover:bg-white/5 transition-colors">
              <img
                src={article.featuredImage.startsWith('http') ? article.featuredImage : article.featuredImage}
                alt={article.title}
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-text-primary truncate">{article.title}</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {article.category?.name} · {formatDate(article.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <span className={`px-2 py-1 rounded-md text-[10px] font-semibold
                  ${article.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {article.isPublished ? 'Published' : 'Draft'}
                </span>
                <Link
                  to={`/admin/articles/${article._id}`}
                  className="text-xs text-primary hover:text-primary-light transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
