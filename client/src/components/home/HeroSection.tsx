import Container from '@/components/common/Container';
import Section from '@/components/common/Section';
import ArticleCard from '@/components/common/ArticleCard';
import type { Article } from '@/types';

interface HeroSectionProps {
  featured: Article | null;
  trending: Article[];
}

const HeroSection = ({ featured, trending }: HeroSectionProps) => {
  if (!featured) return null;

  return (
    <Section spacing="md" className="relative pt-8 sm:pt-12 md:pt-14 pb-10 md:pb-14 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_12%_4%,rgba(212,175,55,0.16),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.9),transparent_28%)]" />
      <Container>
        <div className="relative space-y-8 sm:space-y-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(300px,0.22fr)] lg:items-end">
            <div>
              <span className="font-accent text-[10px] font-bold uppercase tracking-[0.22em] text-[#b8942e]">
                Dubai City Guide
              </span>
              <h1 className="mt-4 max-w-3xl font-heading text-[34px] font-extrabold leading-[1.02] tracking-[-0.055em] text-[#151515] sm:text-[46px] lg:text-[60px]">
                Fresh stories for how Dubai lives, eats, moves and explores.
              </h1>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-[#6f6a62] lg:ml-auto">
              A cleaner homepage built around useful city picks, calm spacing, readable cards and quick access to the sections readers visit most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 lg:gap-8">
            <div className="md:col-span-7 lg:col-span-8">
              <ArticleCard article={featured} variant="large" />
            </div>

            <div className="md:col-span-5 lg:col-span-4 flex flex-col rounded-[26px] border border-black/[0.05] bg-white p-5 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.045)]">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h3 className="font-accent text-[11px] font-bold tracking-[0.2em] uppercase text-[#b8942e]">
                  Trending Now
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-[#d4af37]/45 to-transparent" />
              </div>
              <div className="space-y-3 flex-1">
                {trending.map((article, index) => (
                  <ArticleCard
                    key={article._id}
                    article={article}
                    variant="horizontal"
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default HeroSection;
