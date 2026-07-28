import type { Metadata } from 'next';
import { HomePageClient } from '@/components/home/HomePageClient';
import { contentApi } from '@/lib/api';
import { resolvePageMeta, toNextMetadata } from '@/lib/seoMeta';
import type { Article } from '@/types/api';

export const dynamic = 'force-dynamic';

async function loadHomeData() {
  const [featured, latest, settings] = await Promise.all([
    contentApi.featured(),
    contentApi.latest(36),
    contentApi.settings(),
  ]);

  const sections = settings?.homepage?.sections || [];
  const categorySlugs = Array.from(
    new Set(sections.map((section) => section.source === 'category' ? section.categorySlug : '').filter(Boolean))
  ) as string[];

  const categoryEntries = await Promise.all(
    categorySlugs.map(async (slug) => {
      try {
        const { articles } = await contentApi.articlesByCategory(slug, 1, 24);
        return [slug, articles] as const;
      } catch {
        return [slug, [] as Article[]] as const;
      }
    })
  );

  return {
    featured,
    latest,
    settings,
    categoryStories: Object.fromEntries(categoryEntries),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await contentApi.settings();
  const meta = resolvePageMeta(
    settings?.pageSeo?.home || {},
    {
      title: settings?.siteName,
      description: settings?.tagline,
      image: settings?.logo,
    },
    settings?.seoDefaults,
    settings?.siteName || 'Dubai Blooms',
    '/'
  );
  return toNextMetadata(meta);
}

export default async function Page() {
  const data = await loadHomeData();
  return <HomePageClient {...data} />;
}
