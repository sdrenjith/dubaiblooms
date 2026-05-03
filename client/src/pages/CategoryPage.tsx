import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEOHead from '@/components/common/SEOHead';
import Container from '@/components/common/Container';
import Section from '@/components/common/Section';
import SectionHeader from '@/components/common/SectionHeader';
import ArticleCard from '@/components/common/ArticleCard';
import { articlesAPI } from '@/services/api';
import type { Article, Category } from '@/types';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const { data } = await articlesAPI.getByCategory(slug, { page, limit: 12 });
        setArticles(data.data.articles);
        setCategory(data.data.category);
        setTotalPages(data.pagination.pages);
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slug, page]);

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

  return (
    <>
      <SEOHead
        title={category?.name || 'Category'}
        description={category?.description || `Browse ${category?.name} articles on Dubai Blooms`}
      />

      <Section spacing="xl" className="pb-8 md:pb-12">
        <Container>
          <SectionHeader
            title={category?.name || ''}
            subtitle={category?.description || ''}
            label="Category"
            align="center"
          />
          <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent max-w-4xl mx-auto" />
        </Container>
      </Section>

      <Section spacing="lg" className="pt-0">
        <Container>
          {articles.length === 0 ? (
            <div className="text-center py-24 text-text-muted font-accent tracking-wide">
              No articles found in this category.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
                {articles.map((article, index) => (
                  <ArticleCard key={article._id} article={article} index={index} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-3 mt-14 sm:mt-16 md:mt-20 lg:mt-24">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-12 h-12 rounded-full text-[13px] font-accent font-bold transition-all duration-300 cursor-pointer shadow-sm
                        ${p === page
                          ? 'bg-[#1a1a1a] text-white shadow-lg scale-110'
                          : 'bg-white border border-[#e0ddd6] text-[#888] hover:text-[#1a1a1a] hover:border-[#1a1a1a]/30'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </Container>
      </Section>
    </>
  );
};

export default CategoryPage;
