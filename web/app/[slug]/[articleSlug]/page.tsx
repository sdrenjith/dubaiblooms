import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleMediaSidebar } from '@/components/article/ArticleMediaSidebar';
import { InstagramPromoCard } from '@/components/article/InstagramPromoCard';
import { contentApi } from '@/lib/api';
import { formatArticleByline } from '@/lib/articleByline';
import { prepareArticleBodyHtml } from '@/lib/articleContent';
import { resolveMediaSrc } from '@/lib/mediaUrl';
import { resolvePageMeta, toNextMetadata } from '@/lib/seoMeta';
import { sortedStoryMedia } from '@/lib/storyMedia';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string; articleSlug: string }>;
};

async function loadArticle(categorySlug: string, articleSlug: string) {
  const data = await contentApi.articleBySlug(articleSlug);
  const article = data.article;
  if (!article || article.category?.slug !== categorySlug) {
    return { article: null, related: [] };
  }
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, articleSlug } = await params;
  const [settings, data] = await Promise.all([contentApi.settings(), loadArticle(slug, articleSlug)]);
  const article = data.article;
  if (!article) {
    return toNextMetadata(
      resolvePageMeta(
        { metaTitle: 'Page not found', noIndex: true },
        { title: 'Page not found', description: settings?.tagline || '' },
        settings?.seoDefaults,
        settings?.siteName || 'Dubai Blooms',
        `/${slug}/${articleSlug}`
      )
    );
  }
  const path = `/${article.category?.slug || 'story'}/${article.slug}`;
  return toNextMetadata(
    resolvePageMeta(
      article.seo || {},
      { title: article.title, description: article.excerpt, image: article.featuredImage },
      settings?.seoDefaults,
      settings?.siteName || 'Dubai Blooms',
      path
    )
  );
}

export default async function Page({ params }: Props) {
  const { slug, articleSlug } = await params;
  const [settings, articleData] = await Promise.all([contentApi.settings(), loadArticle(slug, articleSlug)]);
  const { article, related } = articleData;
  if (!article) {
    notFound();
  }

  const heroSrc = resolveMediaSrc(article.featuredImage);
  const storyMedia = sortedStoryMedia(article);
  const hasMediaSidebar = storyMedia.length > 0;
  const authorName = article.author?.name?.trim();
  const publishedLabel = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  const metaParts = [
    authorName ? `By ${authorName}` : null,
    publishedLabel || null,
    article.readingTime ? `${article.readingTime} min read` : 'Editorial',
    `${article.views || 0} views`,
  ].filter(Boolean);

  const avatarSrc = resolveMediaSrc(settings?.logo);
  const promoImages = [
    heroSrc,
    ...storyMedia
      .filter((item) => item.type !== 'video')
      .map((item) => resolveMediaSrc(item.url))
      .filter(Boolean),
  ]
    .filter((src, i, arr) => Boolean(src) && arr.indexOf(src) === i)
    .slice(0, 5);

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
        <p className="article-meta-line">{metaParts.join(' • ')}</p>
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

      <InstagramPromoCard
        profileUrl={settings?.socialLinks?.instagram}
        postUrl={article.instagramPostUrl}
        avatarSrc={avatarSrc || null}
        images={promoImages}
        previewAlt={article.title}
      />

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
            <Link key={item._id} className="feed-card" href={`/${item.category?.slug || 'story'}/${item.slug}`}>
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
                {formatArticleByline(item) ? (
                  <p className="card-byline">{formatArticleByline(item)}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
