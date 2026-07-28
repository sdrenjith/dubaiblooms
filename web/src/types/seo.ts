export interface SeoFields {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  keywords?: string[];
  canonicalPath?: string;
  noIndex?: boolean;
}

export function normalizeSeoFields(raw?: SeoFields | null): SeoFields {
  const keywords = Array.isArray(raw?.keywords)
    ? raw.keywords.map((k) => String(k).trim()).filter(Boolean).slice(0, 20)
    : [];
  return {
    metaTitle: (raw?.metaTitle || '').trim().slice(0, 90),
    metaDescription: (raw?.metaDescription || '').trim().slice(0, 180),
    ogImage: (raw?.ogImage || '').trim(),
    keywords,
    canonicalPath: (raw?.canonicalPath || '').trim(),
    noIndex: !!raw?.noIndex,
  };
}
