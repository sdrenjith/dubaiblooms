import { resolveMediaSrc } from '@/lib/mediaUrl';
import { normalizeSeoFields, type SeoFields } from '@/types/seo';
import type { Settings } from '@/types/api';

export type SeoDefaults = NonNullable<Settings['seoDefaults']>;

export type ResolvedPageMeta = {
  title: string;
  description: string;
  image: string;
  path: string;
  canonicalPath: string;
  siteName: string;
  keywords: string[];
  noIndex: boolean;
};

export function normalizeSeoDefaults(raw?: SeoDefaults | null): SeoFields {
  return normalizeSeoFields(raw);
}

export function normalizeArticleSeoForSave(raw?: SeoFields | null): SeoFields {
  return normalizeSeoFields(raw);
}

export function resolvePageMeta(
  overrides: SeoFields | undefined,
  fallbacks: { title?: string; description?: string; image?: string },
  defaults: SeoDefaults | undefined,
  siteName: string,
  path: string
): ResolvedPageMeta {
  const site = siteName.trim() || 'Dubai Blooms';
  const normOverrides = normalizeSeoFields(overrides);
  const normDefaults = normalizeSeoFields(defaults);

  const title =
    normOverrides.metaTitle ||
    fallbacks.title?.trim() ||
    normDefaults.metaTitle ||
    site;
  const description =
    normOverrides.metaDescription ||
    fallbacks.description?.trim() ||
    normDefaults.metaDescription ||
    '';
  const image =
    resolveMediaSrc(normOverrides.ogImage || fallbacks.image?.trim() || normDefaults.ogImage) || '';
  const keywords =
    (normOverrides.keywords?.length ? normOverrides.keywords : normDefaults.keywords) || [];
  const canonicalPath = path;
  const noIndex = normOverrides.noIndex ?? normDefaults.noIndex ?? false;

  return {
    title,
    description,
    image,
    path,
    canonicalPath,
    siteName: site,
    keywords,
    noIndex,
  };
}

function upsertMeta(selector: string, create: () => HTMLElement, content: string): void {
  let el = document.querySelector(selector) as HTMLElement | null;
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string): void {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Apply title, description, keywords, robots, OG, Twitter, and canonical tags. */
export function applyPageMeta(meta: ResolvedPageMeta): void {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const canonicalPath = meta.canonicalPath.startsWith('/') ? meta.canonicalPath : `/${meta.canonicalPath}`;
  const canonical = origin ? `${origin}${canonicalPath}` : canonicalPath;
  const ogTitle = meta.title;
  const keywords = meta.keywords.join(', ');

  document.title = ogTitle;

  upsertMeta(
    'meta[name="description"]',
    () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      return m;
    },
    meta.description
  );

  upsertMeta(
    'meta[name="keywords"]',
    () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'keywords');
      return m;
    },
    keywords
  );

  upsertMeta(
    'meta[name="robots"]',
    () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'robots');
      return m;
    },
    meta.noIndex ? 'noindex, nofollow' : 'index, follow'
  );

  for (const [property, content] of [
    ['og:title', ogTitle],
    ['og:description', meta.description],
    ['og:type', 'website'],
    ['og:site_name', meta.siteName],
    ['og:url', canonical],
    ['og:image', meta.image],
  ] as const) {
    upsertMeta(
      `meta[property="${property}"]`,
      () => {
        const m = document.createElement('meta');
        m.setAttribute('property', property);
        return m;
      },
      content
    );
  }

  for (const [name, content] of [
    ['twitter:card', meta.image ? 'summary_large_image' : 'summary'],
    ['twitter:title', ogTitle],
    ['twitter:description', meta.description],
    ['twitter:image', meta.image],
  ] as const) {
    upsertMeta(
      `meta[name="${name}"]`,
      () => {
        const m = document.createElement('meta');
        m.setAttribute('name', name);
        return m;
      },
      content
    );
  }

  upsertLink('canonical', canonical);
}
