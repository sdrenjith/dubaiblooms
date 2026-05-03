import { useState, useEffect } from 'react';
import SEOHead from '@/components/common/SEOHead';
import Container from '@/components/common/Container';
import HeroSection from '@/components/home/HeroSection';
import ArticleGrid from '@/components/home/ArticleGrid';
import CategoryBlock from '@/components/home/CategoryBlock';
import { articlesAPI, categoriesAPI } from '@/services/api';
import { generateOrganizationJsonLd } from '@/utils/seo';
import type { Article, Category } from '@/types';

const HomePage = () => {
  const [featured, setFeatured] = useState<Article[]>([]);
  const [latest, setLatest] = useState<Article[]>([]);
  const [categoryBlocks, setCategoryBlocks] = useState<(Category & { articles: Article[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, latestRes, catRes] = await Promise.all([
          articlesAPI.getFeatured(),
          articlesAPI.getAll({ limit: 6 }),
          categoriesAPI.getWithArticles(),
        ]);
        setFeatured(featuredRes.data.data);
        setLatest(latestRes.data.data);
        setCategoryBlocks(catRes.data.data as any);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="w-10 h-10 rounded-full border-2 border-[#b8942e]/20 border-t-[#b8942e] animate-spin" />
          <span className="font-accent text-[11px] uppercase tracking-[0.2em] text-[#bbb]">Loading</span>
        </div>
      </div>
    );
  }

  const heroArticle = featured[0] || null;
  const trendingArticles = featured.slice(1, 6);

  return (
    <>
      <SEOHead jsonLd={generateOrganizationJsonLd()} />

      <HeroSection featured={heroArticle} trending={trendingArticles} />

      <ArticleGrid
        articles={latest}
        title="Latest Stories"
        subtitle="The most recent articles from across our editorial desk"
      />

      <Container>
        <div className="my-6 h-px bg-gradient-to-r from-transparent via-[#b8942e]/20 to-transparent" />
      </Container>

      <div className="space-y-8 sm:space-y-10 lg:space-y-12 py-4 sm:py-6">
        {categoryBlocks.map((category, index) => (
          <CategoryBlock key={category._id} category={category} index={index} />
        ))}
      </div>
    </>
  );
};

export default HomePage;
