import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate, getReadingTimeText, getImageUrl } from '@/utils/helpers';
import type { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'large' | 'horizontal' | 'minimal';
  index?: number;
}

const ArticleCard = ({ article, variant = 'default', index = 0 }: ArticleCardProps) => {
  const articleUrl = `/${article.category?.slug || 'uncategorized'}/${article.slug}`;

  if (variant === 'horizontal') {
    return (
      <motion.article
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        viewport={{ once: true }}
        className="flex gap-4 p-4 group rounded-2xl border border-transparent hover:border-black/[0.04] hover:bg-[#f8f6f1] transition-all duration-300"
      >
        <Link to={articleUrl} className="shrink-0 w-[78px] h-[78px] sm:w-[88px] sm:h-[88px] rounded-2xl overflow-hidden">
          <img
            src={getImageUrl(article.featuredImage)}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        </Link>
        <div className="flex flex-col justify-center min-w-0 gap-1.5">
          <span className="font-accent text-[10px] font-bold tracking-[0.16em] uppercase text-[#b8942e]">
            {article.category?.name}
          </span>
          <Link to={articleUrl}>
            <h3 className="font-heading font-semibold text-[15px] sm:text-[16px] text-[#1a1a1a] leading-[1.3] line-clamp-2 
              group-hover:text-[#b8942e] transition-colors duration-300">
              {article.title}
            </h3>
          </Link>
          <span className="font-accent text-[10px] text-[#aaa] tracking-wide uppercase">
            {formatDate(article.publishedAt)}
          </span>
        </div>
      </motion.article>
    );
  }

  if (variant === 'large') {
    return (
      <motion.article
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative rounded-[26px] overflow-hidden group h-full min-h-[280px] sm:min-h-[320px] md:min-h-[390px] lg:min-h-[440px]"
      >
        <Link to={articleUrl} className="block h-full">
          <img
            src={getImageUrl(article.featuredImage)}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1400ms]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
            <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-accent font-bold 
              tracking-[0.16em] uppercase bg-white/15 text-white/90 backdrop-blur-md 
              border border-white/15 mb-5">
              {article.category?.name}
            </span>

            <h2 className="font-heading font-extrabold text-[25px] sm:text-[32px] lg:text-[40px] 
              !text-white leading-[1.08] group-hover:!text-[#e8d07a] transition-colors duration-500 
              mb-4 max-w-3xl">
              {article.title}
            </h2>
            <p className="text-white/50 text-[15px] line-clamp-2 max-w-2xl leading-relaxed mb-6">
              {article.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-accent text-[10px] text-white/35 tracking-[0.12em] uppercase">
              <span>{article.author?.name}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{formatDate(article.publishedAt)}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{getReadingTimeText(article.readingTime)}</span>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === 'minimal') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: index * 0.06 }}
        viewport={{ once: true }}
        className="bg-white rounded-[18px] overflow-hidden group border border-black/[0.04] shadow-[0_3px_18px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.07)] transition-all duration-500"
      >
        <Link to={articleUrl} className="block aspect-[16/7] overflow-hidden">
          <img
            src={getImageUrl(article.featuredImage)}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[900ms]"
            loading="lazy"
          />
        </Link>

        <div className="p-4">
          <span className="font-accent text-[9px] font-bold tracking-[0.16em] uppercase text-[#b8942e]">
            {article.category?.name}
          </span>

          <Link to={articleUrl}>
            <h3 className="font-heading font-extrabold text-[16px] text-[#1a1a1a] mt-2 mb-2 leading-[1.25] line-clamp-2 group-hover:text-[#b8942e] transition-colors duration-300">
              {article.title}
            </h3>
          </Link>

          <p className="text-[#888] text-[13px] line-clamp-2 leading-[1.55] mb-4">
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 font-accent text-[9px] text-[#bbb] tracking-[0.1em] uppercase pt-3 border-t border-black/[0.05]">
            <span>{formatDate(article.publishedAt)}</span>
            <span>{getReadingTimeText(article.readingTime)}</span>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.09 }}
      viewport={{ once: true }}
      className="bg-white rounded-[26px] overflow-hidden group 
        border border-black/[0.05] shadow-[0_10px_34px_rgba(0,0,0,0.045)]
        hover:shadow-[0_18px_58px_rgba(0,0,0,0.08)] hover:-translate-y-1
        transition-all duration-500"
    >
      <Link to={articleUrl} className="block aspect-[16/9] overflow-hidden p-3 pb-0">
        <img
          src={getImageUrl(article.featuredImage)}
          alt={article.title}
          className="w-full h-full rounded-[20px] object-cover group-hover:scale-105 transition-transform duration-[1000ms]"
          loading="lazy"
        />
      </Link>

      <div className="p-6 pt-5">
        <span className="font-accent text-[10px] font-bold tracking-[0.16em] uppercase text-[#b8942e]">
          {article.category?.name}
        </span>

        <Link to={articleUrl}>
          <h3 className="font-heading font-extrabold text-[18px] sm:text-[20px] text-[#1a1a1a] mt-3 mb-3 
            leading-[1.22] line-clamp-2 group-hover:text-[#b8942e] transition-colors duration-300">
            {article.title}
          </h3>
        </Link>

        <p className="text-[#888] text-[14px] line-clamp-2 leading-[1.65] mb-5">
          {article.excerpt}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 font-accent text-[10px] text-[#bbb] 
          tracking-[0.1em] uppercase pt-4 border-t border-black/[0.05]">
          <span>{formatDate(article.publishedAt)}</span>
          <span>{getReadingTimeText(article.readingTime)}</span>
        </div>
      </div>
    </motion.article>
  );
};

export default ArticleCard;
