export const SLUG_MAX_LENGTH = 120;

/** Normalize slug input for admin fields (matches server generateSlug). */
export function normalizeSlugInput(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, '');
}

export function isValidSlugInput(slug: string): boolean {
  return slug.length > 0 && slug.length <= SLUG_MAX_LENGTH && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
