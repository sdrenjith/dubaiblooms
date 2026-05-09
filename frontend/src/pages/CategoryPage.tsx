import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { contentApi } from '@/lib/api';
import { useSiteData } from '@/hooks/useSiteData';
import type { Article, Category } from '@/types/api';

function getImageUrl(image?: string): string {
  if (!image) {
    return '';
  }
  if (image.startsWith('http')) {
    return image;
  }
  return image.startsWith('/') ? image : `/${image}`;
}

export function CategoryPage() {
  const { slug = '' } = useParams();
  const { settings } = useSiteData();
  const cardsPerPage = Math.min(24, Math.max(2, settings?.listing?.cardsPerPage ?? 4));
  const pageSize = cardsPerPage + 1;
  const [leadArticle, setLeadArticle] = useState<Article | null>(null);
  const [stories, setStories] = useState<Article[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readableCategory = slug
    .split('-')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
  const [categoryMeta, setCategoryMeta] = useState<Category | null>(null);

  useEffect(() => {
    if (!slug) {
      setCategoryMeta(null);
      return;
    }
    let isMounted = true;
    void contentApi.categoryBySlug(slug).then((data) => {
      if (isMounted) {
        setCategoryMeta(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let isMounted = true;

    const loadCategoryFirstPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await contentApi.articlesByCategory(slug, 1, pageSize);
        const [first, ...rest] = data.articles;
        if (isMounted) {
          setLeadArticle(first || null);
          setStories(rest);
          setPage(1);
          setTotalPages(Math.max(1, data.pagination.pages || 1));
        }
      } catch {
        if (isMounted) {
          setError('Unable to load this category right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadCategoryFirstPage();

    return () => {
      isMounted = false;
    };
  }, [slug, pageSize]);

  const onViewMore = async () => {
    if (loadingMore || loading || page >= totalPages || !slug) {
      return;
    }

    const nextPage = page + 1;
    setLoadingMore(true);
    setError(null);
    try {
      const data = await contentApi.articlesByCategory(slug, nextPage, pageSize);
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

  const categoryTitle = categoryMeta?.name || readableCategory || 'Stories';
  const categorySubtitle =
    categoryMeta?.description?.trim() ||
    'Curated features, guides, and editorial insights from this desk.';

  return (
    <div className="page-wrap section section-category">
      {categoryMeta?.image ? (
        <div className="category-cover">
          <img src={getImageUrl(categoryMeta.image)} alt="" />
        </div>
      ) : null}
      <h1 className="section-title">{categoryTitle}</h1>
      <p className="section-subtitle">{categorySubtitle}</p>
      {error ? <div className="status-banner">{error}</div> : null}

      {!loading && !error && leadArticle ? (
        <Link className="feature-article" to={`/${leadArticle.category?.slug || slug}/${leadArticle.slug}`}>
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
            <p className="feature-article-excerpt">{leadArticle.excerpt}</p>
            <span className="feature-article-cta">
              Read full story <span aria-hidden="true">→</span>
            </span>
          </div>
        </Link>
      ) : null}

      <div className="list">
        {loading ? (
          <article className="list-item">
            <div className="list-item-link">
              <div className="list-item-copy">
                <p className="card-meta">Loading</p>
                <h3>Fetching category articles...</h3>
              </div>
            </div>
          </article>
        ) : null}
        {!loading && !error && !leadArticle && stories.length === 0 ? (
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
            <Link className="list-item-link" to={`/${item.category?.slug || slug}/${item.slug}`}>
              <div className="list-item-copy">
                <p className="card-meta">{item.category?.name || readableCategory || 'Story'}</p>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {!loading && !error && totalPages > 1 ? (
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
