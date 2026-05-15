import type { Category } from '@/types/api';

/** Old DB rows without this field behave like they're shown (backward compatible). */
export function categoryVisibleInMainMenu(c: Pick<Category, 'showInMainMenu'>): boolean {
  return c.showInMainMenu !== false;
}

/**
 * Category hub uses `/category/:slug`; articles use `/:slug/:articleSlug`.
 * Main nav should stay active on both.
 */
export function isMainNavCategoryActive(pathname: string, slug: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === `/category/${slug}` || path.startsWith(`/category/${slug}/`)) {
    return true;
  }
  const segments = path.split('/').filter(Boolean);
  if (segments[0] === 'category') {
    return false;
  }
  return segments[0] === slug;
}
