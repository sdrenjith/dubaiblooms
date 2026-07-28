'use client';

import { useState } from 'react';
import Link from 'next/link';
import { contentApi } from '@/lib/api';
import { formatArticleByline } from '@/lib/articleByline';
import type { Article, Category } from '@/types/api';

type Props = {
  slug: string;
  category: Category | null;
  initialLeadArticle: Article | null;
  initialStories: Article[];
  initialPage: number;
  totalPages: number;
  cardsPerPage: number;
};

function getImageUrl(image?: string): string {
  if (!image) {
    return '';
  }
  if (image.startsWith('http')) {
    return image;
  }
  return image.startsWith('/') ? image : `/${image}`;
}

function readableFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

export function CategoryPageClient({
  slug,
  category,
  initialLeadArticle,
  initialStories,
  initialPage,
  totalPages: initialTotalPages,
  cardsPerPage,
}: Props) {
  const [leadArticle] = useState<Article | null>(initialLeadArticle);
  const [stories, setStories] = useState<Article[]>(initialStories);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readableCategory = readableFromSlug(slug);
  const categoryTitle = category?.name || readableCategory || 'Stories';
  const categorySubtitle =
    category?.description?.trim() || 'Curated features, guides, and editorial insights from this desk.';

  const onViewMore = async () => {
    if (loadingMore || page >= totalPages || !slug) {
      return;
    }

    const nextPage = page + 1;
    setLoadingMore(true);
    setError(null);
    try {
      const data = await contentApi.articlesByCategory(slug, nextPage, cardsPerPage + 1);
      setStories((prev) => [...prev, ...data.articles]);
      setPage(nextPage);
      setTotalPages(Math.max(1, data.pagination.pages || 1));
    } catch {
      setError('Unable to load more stories right now.');
    } finally {
      setLoadingMore(false);
    }
  };

  const onReadLess = () => {
    setStories((prev) => prev.slice(0, cardsPerPage));
    setPage(1);
  };

  return (
    <div className="page-wrap section section-category">
      {category?.image ? (
        <div className="category-cover">
          <img src={getImageUrl(category.image)} alt="" />
        </div>
      ) : null}
      <h1 className="section-title">{categoryTitle}</h1>
      <p className="section-subtitle">{categorySubtitle}</p>
      {error ? <div className="status-banner">{error}</div> : null}

      {leadArticle ? (
        <Link className="feature-article" href={`/${leadArticle.category?.slug || slug}/${leadArticle.slug}`}>
          <div className="feature-article-media">
            {leadArticle.featuredImage ? (
              <img src={leadArticle.featuredImage} alt={leadArticle.title} />
            ) : (
              <div className="feed-placeholder">Lead Story</div>
            )}
          </div>
          <div className="feature-article-copy">
            <p className="card-meta">{leadArticle.category?.name || readableCategory || 'Story'}</p>
            <h2>{leadArticle.title}</h2>
            {formatArticleByline(leadArticle) ? (
              <p className="card-byline">{formatArticleByline(leadArticle)}</p>
            ) : null}
            <p className="feature-article-excerpt">{leadArticle.excerpt}</p>
            <span className="feature-article-cta">
              Read full story <span aria-hidden="true">→</span>
            </span>
          </div>
        </Link>
      ) : null}

      <div className="list">
        {!leadArticle && stories.length === 0 ? (
          <article className="list-item list-item-empty">
            <div className="list-item-link">
              <div className="list-item-copy">
                <p className="card-meta">No stories yet</p>
                <h3>This category does not have published stories yet.</h3>
              </div>
            </div>
          </article>
        ) : null}
        {stories.map((item) => (
          <article key={item._id} className="list-item">
            <Link className="list-item-link" href={`/${item.category?.slug || slug}/${item.slug}`}>
              <div className="list-item-copy">
                <p className="card-meta">{item.category?.name || readableCategory || 'Story'}</p>
                <h3>{item.title}</h3>
                {formatArticleByline(item) ? (
                  <p className="card-byline">{formatArticleByline(item)}</p>
                ) : null}
                <p>{item.excerpt}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="category-pagination">
          <span className="category-page-indicator">
            {Math.max(1, page)}/{totalPages}
          </span>
          {page < totalPages ? (
            <button type="button" className="view-more-btn" onClick={onViewMore} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'View More'}
            </button>
          ) : (
            <button type="button" className="read-less-btn" onClick={onReadLess}>
              Read less
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
