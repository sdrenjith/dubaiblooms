import type { Metadata } from 'next';
import { absoluteUrl, resolveMediaSrc } from '@/lib/mediaUrl';
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

  const title = normOverrides.metaTitle || fallbacks.title?.trim() || normDefaults.metaTitle || site;
  const description =
    normOverrides.metaDescription || fallbacks.description?.trim() || normDefaults.metaDescription || '';
  const image = resolveMediaSrc(normOverrides.ogImage || fallbacks.image?.trim() || normDefaults.ogImage) || '';
  const keywords = (normOverrides.keywords?.length ? normOverrides.keywords : normDefaults.keywords) || [];
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

export function toNextMetadata(meta: ResolvedPageMeta): Metadata {
  const canonical = absoluteUrl(meta.canonicalPath);
  const image = meta.image ? absoluteUrl(meta.image) : undefined;

  return {
    title: meta.title,
    description: meta.description || undefined,
    keywords: meta.keywords.length ? meta.keywords : undefined,
    alternates: {
      canonical,
    },
    robots: meta.noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title: meta.title,
      description: meta.description || undefined,
      url: canonical,
      siteName: meta.siteName,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: meta.title,
      description: meta.description || undefined,
      images: image ? [image] : undefined,
    },
  };
}
