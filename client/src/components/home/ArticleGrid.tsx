import Container from '@/components/common/Container';
import Section from '@/components/common/Section';
import SectionHeader from '@/components/common/SectionHeader';
import ArticleCard from '@/components/common/ArticleCard';
import type { Article } from '@/types';

interface ArticleGridProps {
  articles: Article[];
  title?: string;
  subtitle?: string;
}

const ArticleGrid = ({ articles, title, subtitle }: ArticleGridProps) => {
  if (articles.length === 0) return null;

  return (
    <Section spacing="lg" className="relative">
      <Container>
        <div className="space-y-8">
          {title && (
            <SectionHeader
              title={title}
              subtitle={subtitle}
              label="Latest Stories"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
            {articles.map((article, index) => (
              <ArticleCard key={article._id} article={article} index={index} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default ArticleGrid;
