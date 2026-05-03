import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEOHead from '@/components/common/SEOHead';
import Container from '@/components/common/Container';
import Section from '@/components/common/Section';
import SectionHeader from '@/components/common/SectionHeader';
import CategoryBadge from '@/components/common/CategoryBadge';
import ShareButtons from '@/components/common/ShareButtons';
import ArticleCard from '@/components/common/ArticleCard';
import { articlesAPI } from '@/services/api';
import { formatDate, getReadingTimeText, getImageUrl } from '@/utils/helpers';
import { generateArticleJsonLd } from '@/utils/seo';
import type { Article } from '@/types';

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const { data } = await articlesAPI.getBySlug(slug);
        setArticle(data.data.article);
        setRelated(data.data.related);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <span className="font-accent text-xs uppercase tracking-widest text-text-muted">Loading</span>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-5xl font-semibold italic text-text-primary mb-6">Article Not Found</h1>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const articleUrl = `/${article.category?.slug || 'uncategorized'}/${article.slug}`;

  return (
    <>
      <SEOHead
        title={article.seo?.metaTitle || article.title}
        description={article.seo?.metaDescription || article.excerpt}
        ogImage={article.seo?.ogImage || article.featuredImage}
        ogUrl={`https://dubaiblooms.com${articleUrl}`}
        type="article"
        jsonLd={generateArticleJsonLd(article)}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative w-full h-[56vh] sm:h-[62vh] md:h-[80vh] overflow-hidden"
      >
        <img
          src={getImageUrl(article.featuredImage)}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fafaf8] via-transparent to-transparent" />
      </motion.div>

      <Container className="-mt-36 sm:-mt-44 md:-mt-48 relative z-10 pb-16 sm:pb-20 md:pb-28">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 md:p-12 xl:p-16 rounded-[32px] sm:rounded-[40px] md:rounded-[48px] border border-white/40 shadow-xl mb-10 sm:mb-12 md:mb-16"
          >
            {article.category && (
              <CategoryBadge name={article.category.name} slug={article.category.slug} size="md" />
            )}

            <h1 className="editorial-title text-[34px] sm:text-4xl md:text-[52px] xl:text-[64px] mt-6 md:mt-8 mb-8 md:mb-10 italic leading-[1.1]">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5 sm:gap-6 pt-8 md:pt-10 border-t border-black/[0.05]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                  <span className="font-accent text-sm font-bold text-white uppercase">
                    {article.author?.name?.[0]}
                  </span>
                </div>
                <div>
                  <span className="text-[15px] font-bold text-[#1a1a1a] block leading-none mb-1">{article.author?.name}</span>
                  <span className="font-accent text-[10px] text-[#bbb] tracking-widest uppercase">Editor</span>
                </div>
              </div>
              <div className="h-8 w-px bg-black/[0.05] hidden sm:block" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-accent text-[11px] text-[#888] tracking-widest uppercase">
                <span>{formatDate(article.publishedAt)}</span>
                <span className="w-1 h-1 rounded-full bg-[#b8942e]/40" />
                <span>{getReadingTimeText(article.readingTime)}</span>
                <span className="w-1 h-1 rounded-full bg-[#b8942e]/40" />
                <span>{article.views.toLocaleString()} views</span>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-10 md:gap-12 lg:gap-16">
            <div className="hidden lg:block shrink-0">
              <div className="sticky top-32">
                <p className="font-accent text-[10px] font-bold uppercase tracking-[0.2em] text-[#bbb] mb-6">Share</p>
                <ShareButtons url={articleUrl} title={article.title} vertical />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex-1 min-w-0"
            >
              <div
                className="prose max-w-none text-[18px] md:text-[20px] leading-[1.9] text-[#444]"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {article.tags && article.tags.length > 0 && (
                <div className="mt-14 sm:mt-16 md:mt-20 pt-8 sm:pt-10 md:pt-12 border-t border-black/[0.05]">
                  <p className="font-accent text-[11px] font-bold uppercase tracking-[0.2em] text-[#bbb] mb-6">Explore Topics</p>
                  <div className="flex flex-wrap gap-3">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-6 py-3 rounded-full text-[12px] font-accent font-bold uppercase tracking-wider 
                          bg-white border border-[#e0ddd6] text-[#666] hover:text-[#1a1a1a] hover:border-[#1a1a1a]/30 
                          transition-all duration-300 cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="lg:hidden mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-black/[0.05]">
                <p className="font-accent text-[11px] font-bold uppercase tracking-[0.2em] text-[#bbb] mb-6 text-center">Share this story</p>
                <ShareButtons url={articleUrl} title={article.title} />
              </div>
            </motion.div>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <Section spacing="xl" className="bg-[#f5f3ee] mx-2 sm:mx-4 md:mx-6 xl:mx-10 rounded-[32px] sm:rounded-[48px] md:rounded-[64px] mb-6 md:mb-8">
          <Container>
            <SectionHeader
              title="Related Stories"
              subtitle="Continue your journey through the extraordinary"
              label="More to Read"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
              {related.slice(0, 3).map((rel, index) => (
                <ArticleCard key={rel._id} article={rel} index={index} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
};

export default ArticlePage;
