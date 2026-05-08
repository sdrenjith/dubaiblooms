import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { contentApi } from '@/lib/api';
import type { Article } from '@/types/api';

export function ArticlePage() {
  const { slug = '' } = useParams();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (!slug) {
      return;
    }
    void contentApi.articleBySlug(slug).then(setArticle);
  }, [slug]);

  if (!article) {
    return (
      <div className="page-wrap section">
        <p>Loading article...</p>
      </div>
    );
  }

  return (
    <article className="page-wrap article">
      <p className="eyebrow">{article.category?.name || 'Story'}</p>
      <h1>{article.title}</h1>
      <p className="lede">{article.excerpt}</p>
      <section dangerouslySetInnerHTML={{ __html: article.content || '' }} />
    </article>
  );
}
