import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArticleMediaSidebar } from '@/components/article/ArticleMediaSidebar';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useSiteData } from '@/hooks/useSiteData';
import { contentApi } from '@/lib/api';
import { prepareArticleBodyHtml } from '@/lib/articleContent';
import { resolvePageMeta } from '@/lib/seoMeta';
import { sortedStoryMedia } from '@/lib/storyMedia';
import { resolveMediaSrc } from '@/lib/mediaUrl';
import type { Article } from '@/types/api';

export function ArticlePage() {
  const { slug = '' } = useParams();
  const { settings } = useSiteData();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let isMounted = true;

    const loadArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await contentApi.articleBySlug(slug);
        if (isMounted) {
          setArticle(data.article);
          setRelated(data.related || []);
          if (!data.article) {
            setError('This story is unavailable.');
          }
        }
      } catch {
        if (isMounted) {
          setError('Unable to load this story right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadArticle();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const pageMeta = useMemo(() => {
    if (!article) {
      return null;
    }
    const path = `/${article.category?.slug || 'story'}/${article.slug}`;
    return resolvePageMeta(
      article.seo || {},
      { title: article.title, description: article.excerpt, image: article.featuredImage },
      settings?.seoDefaults,
      settings?.siteName || 'Dubai Blooms',
      path
    );
  }, [article, settings]);

  usePageMeta(pageMeta);

  if (loading) {
    return (
      <div className="page-wrap section">
        <p>Loading story...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="page-wrap section">
        <div className="status-banner">{error || 'Story not found.'}</div>
        <Link className="button-link" to="/">
          Back to Home
        </Link>
      </div>
    );
  }

  const heroSrc = resolveMediaSrc(article.featuredImage);
  const storyMedia = sortedStoryMedia(article);
  const hasMediaSidebar = storyMedia.length > 0;

  return (
    <div className="page-wrap">
      <article className={`article${hasMediaSidebar ? ' article--with-media' : ''}`}>
        <h1>{article.title}</h1>
        <p className="lede">{article.excerpt}</p>
        {heroSrc ? (
          <figure className="article-hero">
            <img className="article-hero-img" src={heroSrc} alt={article.title} />
          </figure>
        ) : null}
        <p className="article-meta-line">
          {article.readingTime ? `${article.readingTime} min read` : 'Editorial'} • {article.views || 0} views
        </p>
        <div className={`article-layout${hasMediaSidebar ? ' article-layout--with-sidebar' : ''}`}>
          <div className="article-main">
            <section
              className="article-body"
              dangerouslySetInnerHTML={{
                __html: prepareArticleBodyHtml(article.content) || '<p>Content unavailable.</p>',
              }}
            />
          </div>
          {hasMediaSidebar ? <ArticleMediaSidebar media={storyMedia} storyTitle={article.title} /> : null}
        </div>
      </article>

      <section className="section related-section">
        <div className="section-head">
          <h2>Related Stories</h2>
        </div>
        <div className="feed-grid">
          {related.length === 0 ? (
            <article className="feed-card">
              <div className="feed-copy">
                <p className="card-meta">Editorial</p>
                <h3>No related stories available.</h3>
              </div>
            </article>
          ) : null}
          {related.map((item) => (
            <Link key={item._id} className="feed-card" to={`/${item.category?.slug || 'story'}/${item.slug}`}>
              <div className="feed-media">
                {item.featuredImage ? (
                  <img src={resolveMediaSrc(item.featuredImage)} alt={item.title} />
                ) : (
                  <div className="feed-placeholder">Story</div>
                )}
              </div>
              <div className="feed-copy">
                <p className="card-meta">{item.category?.name || 'Story'}</p>
                <h3>{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
