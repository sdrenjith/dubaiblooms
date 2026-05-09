import type { Article } from '@/types/api';

export function articleHref(a: Article): string {
  const cat = a.category?.slug || 'story';
  return `/${cat}/${a.slug}`;
}

export function thumb(src?: string): string {
  if (!src) {
    return '';
  }
  return src.startsWith('http') ? src : src.startsWith('/') ? src : `/${src}`;
}
