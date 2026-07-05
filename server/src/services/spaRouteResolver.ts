import Article from '../models/Article.js';
import Category from '../models/Category.js';
import { isValidSlug } from '../utils/generateSlug.js';

export type SpaRouteStatus = 200 | 404;

/** Normalize pathname: strip trailing slashes (except root). */
export function normalizeSpaPath(pathname: string): string {
  const trimmed = pathname.split('?')[0]?.split('#')[0] ?? '/';
  if (trimmed === '/' || trimmed === '') {
    return '/';
  }
  return trimmed.replace(/\/+$/, '');
}

/**
 * Decide whether a public SPA path should return HTTP 200 or 404 on initial load.
 * Mirrors frontend routes in App.tsx (public shell only).
 */
export async function resolveSpaRoute(pathname: string): Promise<SpaRouteStatus> {
  const path = normalizeSpaPath(pathname);

  if (path === '/') {
    return 200;
  }

  if (path === '/admin' || path.startsWith('/admin/')) {
    return 200;
  }

  const segments = path.split('/').filter(Boolean);

  if (segments[0] === 'category' && segments.length === 2) {
    const slug = segments[1]!;
    if (!isValidSlug(slug)) {
      return 404;
    }
    const category = await Category.findOne({ slug }).select('_id').lean();
    return category ? 200 : 404;
  }

  if (segments.length === 2) {
    const [categorySlug, articleSlug] = segments;
    if (!isValidSlug(categorySlug!) || !isValidSlug(articleSlug!)) {
      return 404;
    }

    const article = await Article.findOne({ slug: articleSlug, isPublished: true })
      .populate('category', 'slug')
      .select('category')
      .lean();

    if (!article) {
      return 404;
    }

    const category = article.category as { slug?: string } | null | undefined;
    if (!category?.slug || category.slug !== categorySlug) {
      return 404;
    }

    return 200;
  }

  return 404;
}
