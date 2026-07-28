import type { Category } from '@/types/api';

export function categoryVisibleInMainMenu(c: Pick<Category, 'showInMainMenu'>): boolean {
  return c.showInMainMenu !== false;
}

export function isMainNavCategoryActive(pathname: string, slug: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === `/${slug}`) {
    return true;
  }
  if (path === `/category/${slug}` || path.startsWith(`/category/${slug}/`)) {
    return true;
  }
  const segments = path.split('/').filter(Boolean);
  if (segments[0] === 'category') {
    return false;
  }
  return segments[0] === slug;
}
