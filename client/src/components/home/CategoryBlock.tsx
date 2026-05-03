import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import Container from '@/components/common/Container';
import Section from '@/components/common/Section';
import { formatDate, getImageUrl } from '@/utils/helpers';
import type { Article, Category } from '@/types';

interface CategoryBlockProps {
  category: Category & { articles: Article[] };
  index: number;
}

const CategoryBlock = ({ category, index }: CategoryBlockProps) => {
  if (!category.articles || category.articles.length === 0) return null;

  const isAlternate = index % 2 === 1;
  const [featuredArticle, ...supportingArticles] = category.articles.slice(0, 4);
  if (!featuredArticle) return null;

  const featuredUrl = `/${featuredArticle.category?.slug || category.slug}/${featuredArticle.slug}`;

  return (
    <Section 
      spacing="none"
      className="py-4 sm:py-5"
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: index * 0.04 }}
          viewport={{ once: true }}
          className={`relative overflow-hidden rounded-[32px] border p-6 sm:p-8 lg:p-10 shadow-[0_22px_82px_rgba(0,0,0,0.052)] ${
            isAlternate
              ? 'border-[#d9c898]/35 bg-[#f5f3ee]/75'
              : 'border-black/[0.05] bg-white/70'
          } backdrop-blur-xl`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(circle at 16% 0%, rgba(212,175,55,0.14), transparent 30%), linear-gradient(120deg, rgba(255,255,255,0.65), transparent 42%)',
            }}
          />

          <div className="relative flex flex-col gap-8 lg:gap-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-[2px] bg-gradient-to-r from-[#b8942e] to-[#d4af37] rounded-full" />
                  <span className="font-accent text-[10px] font-bold tracking-[0.2em] uppercase text-[#b8942e]">
                    Explore
                  </span>
                </div>
                <h2 className="font-heading font-extrabold text-[25px] sm:text-[30px] tracking-[-0.045em] text-[#1a1a1a] leading-[1.05]">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-[#777] text-[13px] sm:text-[14px] mt-2 max-w-sm leading-relaxed">
                    {category.description}
                  </p>
                )}
              </div>

              <Link
                to={`/category/${category.slug}`}
                className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-full border border-[#d8c58c]/60 bg-white/85 px-4 py-2 font-accent text-[10px] font-bold uppercase tracking-[0.14em] text-[#555] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#b8942e]/40 hover:text-[#b8942e] hover:shadow-md active:translate-y-0 group"
              >
                View All
                <FiArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)] gap-7 sm:gap-8 lg:gap-10">
              <Link
                to={featuredUrl}
                className="group overflow-hidden rounded-[26px] border border-black/[0.05] bg-white p-3 shadow-[0_14px_44px_rgba(0,0,0,0.055)]"
              >
                <div className="aspect-[16/7] overflow-hidden rounded-[20px]">
                  <img
                    src={getImageUrl(featuredArticle.featuredImage)}
                    alt={featuredArticle.title}
                    className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <span className="font-accent text-[9px] font-bold tracking-[0.16em] uppercase text-[#b8942e]">
                    {category.name}
                  </span>
                  <h3 className="mt-2 font-heading text-[19px] sm:text-[22px] font-extrabold leading-[1.18] tracking-[-0.035em] text-[#171717] line-clamp-2 group-hover:text-[#b8942e] transition-colors duration-300">
                    {featuredArticle.title}
                  </h3>
                  <p className="mt-2 text-[13px] sm:text-[14px] leading-relaxed text-[#777] line-clamp-2">
                    {featuredArticle.excerpt}
                  </p>
                </div>
              </Link>

              <div className="grid grid-cols-1 gap-5 rounded-[26px] border border-black/[0.05] bg-white/55 p-5 sm:p-6">
                {supportingArticles.slice(0, 3).map((article) => {
                  const articleUrl = `/${article.category?.slug || category.slug}/${article.slug}`;
                  return (
                    <Link
                      key={article._id}
                      to={articleUrl}
                      className="group grid grid-cols-[104px_1fr] gap-5 rounded-[20px] border border-black/[0.04] bg-white/90 p-4 sm:p-5 shadow-[0_8px_28px_rgba(0,0,0,0.035)] transition-all duration-300 hover:bg-white hover:shadow-[0_12px_34px_rgba(0,0,0,0.06)]"
                    >
                      <div className="h-[88px] overflow-hidden rounded-[14px]">
                        <img
                          src={getImageUrl(article.featuredImage)}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0 self-center">
                        <span className="font-accent text-[8px] font-bold tracking-[0.15em] uppercase text-[#b8942e]">
                          {category.name}
                        </span>
                        <h3 className="mt-1 font-heading text-[14px] sm:text-[15px] font-extrabold leading-[1.25] tracking-[-0.03em] text-[#171717] line-clamp-2 group-hover:text-[#b8942e] transition-colors duration-300">
                          {article.title}
                        </h3>
                        <span className="mt-1.5 block font-accent text-[9px] uppercase tracking-[0.1em] text-[#aaa]">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default CategoryBlock;
