import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { contentApi } from '@/lib/api';
import type { Article } from '@/types/api';

export function CategoryPage() {
  const { slug = '' } = useParams();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (!slug) {
      return;
    }
    void contentApi.articlesByCategory(slug).then(setArticles);
  }, [slug]);

  return (
    <div className="page-wrap section">
      <p className="eyebrow">Category</p>
      <h1 className="section-title">{slug.replace('-', ' ')}</h1>
      <div className="list">
        {articles.map((item) => (
          <article key={item._id} className="list-item">
            <p className="card-meta">{item.category?.name}</p>
            <h3>
              <Link to={`/${item.category?.slug || slug}/${item.slug}`}>{item.title}</Link>
            </h3>
            <p>{item.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
