/** Shared SEO subdocument fields used on settings, categories, and articles. */
export const seoFieldsDefinition = {
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  ogImage: { type: String, default: '' },
  keywords: { type: [String], default: [] },
  canonicalPath: { type: String, default: '' },
  noIndex: { type: Boolean, default: false },
} as const;
