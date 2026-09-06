import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { contentApi } from '@/lib/api';
import { prepareArticleBodyHtml } from '@/lib/articleContent';
import { resolveMediaSrc } from '@/lib/mediaUrl';
import { resolvePageMeta, toNextMetadata } from '@/lib/seoMeta';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [settings, data] = await Promise.all([contentApi.settings(), contentApi.authorBySlug(slug)]);
  const author = data.author;
  if (!author) {
    return toNextMetadata(
      resolvePageMeta(
        { metaTitle: 'Author not found', noIndex: true },
        { title: 'Author not found', description: settings?.tagline || '' },
        settings?.seoDefaults,
        settings?.siteName || 'Dubai Blooms',
        `/author/${slug}`
      )
    );
  }
  const bioPlain = (author.bio || '').replace(/<[^>]*>/g, '').trim();
  return toNextMetadata(
    resolvePageMeta(
      {},
      {
        title: author.name,
        description: bioPlain || `Stories by ${author.name} on Dubai Blooms.`,
        image: author.avatar || undefined,
      },
      settings?.seoDefaults,
      settings?.siteName || 'Dubai Blooms',
      `/author/${author.slug || slug}`
    )
  );
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const data = await contentApi.authorBySlug(slug);
  const author = data.author;
  if (!author) {
    notFound();
  }

  const avatarSrc = resolveMediaSrc(author.avatar);
  const bioHtml = prepareArticleBodyHtml(author.bio || '');
  const initial = (author.name.trim().charAt(0) || 'A').toUpperCase();

  return (
    <div className="page-wrap">
      <header className="author-profile-header">
        <div className="author-avatar-wrap" aria-hidden={!avatarSrc}>
          {avatarSrc ? (
            <img className="author-avatar" src={avatarSrc} alt="" />
          ) : (
            <div className="author-avatar author-avatar--fallback">{initial}</div>
          )}
        </div>
        <h1 className="author-profile-name">{author.name}</h1>
        {bioHtml ? (
          <div className="author-profile-bio" dangerouslySetInnerHTML={{ __html: bioHtml }} />
        ) : null}
      </header>

      <section className="author-articles-section" aria-label={`Articles by ${author.name}`}>
        {data.articles.length === 0 ? (
          <p className="author-articles-empty">No published stories yet.</p>
        ) : (
          <ul className="author-article-list">
            {data.articles.map((item) => {
              const href = `/${item.category?.slug || 'story'}/${item.slug}`;
              const thumb = resolveMediaSrc(item.featuredImage);
              return (
                <li key={item._id} className="author-article-row">
                  <Link className="author-article-link" href={href}>
                    <div className="author-article-thumb">
                      {thumb ? (
                        <img src={thumb} alt="" />
                      ) : (
                        <div className="author-article-thumb-empty">Story</div>
                      )}
                    </div>
                    <div className="author-article-copy">
                      <p className="card-meta">{item.category?.name || 'Story'}</p>
                      <h2>{item.title}</h2>
                      {item.excerpt ? <p className="author-article-excerpt">{item.excerpt}</p> : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
