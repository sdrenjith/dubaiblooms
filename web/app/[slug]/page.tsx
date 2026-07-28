import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryPageClient } from '@/components/category/CategoryPageClient';
import { contentApi } from '@/lib/api';
import { resolvePageMeta, toNextMetadata } from '@/lib/seoMeta';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

function readableFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [settings, category] = await Promise.all([contentApi.settings(), contentApi.categoryBySlug(slug)]);
  if (!category) {
    return toNextMetadata(
      resolvePageMeta(
        { metaTitle: 'Page not found', noIndex: true },
        { title: 'Page not found', description: settings?.tagline || '' },
        settings?.seoDefaults,
        settings?.siteName || 'Dubai Blooms',
        `/${slug}`
      )
    );
  }
  const title = category.name || readableFromSlug(slug);
  const description = category.description || settings?.tagline || '';
  return toNextMetadata(
    resolvePageMeta(
      category.seo || {},
      { title, description, image: category.image },
      settings?.seoDefaults,
      settings?.siteName || 'Dubai Blooms',
      `/${slug}`
    )
  );
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [settings, category] = await Promise.all([contentApi.settings(), contentApi.categoryBySlug(slug)]);
  if (!category) {
    notFound();
  }
  const cardsPerPage = Math.min(24, Math.max(2, settings?.listing?.cardsPerPage ?? 4));
  const pageSize = cardsPerPage + 1;
  const data = await contentApi.articlesByCategory(slug, 1, pageSize);
  const [first, ...rest] = data.articles;

  return (
    <CategoryPageClient
      slug={slug}
      category={category}
      initialLeadArticle={first || null}
      initialStories={rest}
      initialPage={1}
      totalPages={Math.max(1, data.pagination.pages || 1)}
      cardsPerPage={cardsPerPage}
    />
  );
}
