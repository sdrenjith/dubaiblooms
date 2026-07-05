import { useEffect, useMemo } from 'react';
import { applyPageMeta, type ResolvedPageMeta } from '@/lib/seoMeta';

export function usePageMeta(meta: ResolvedPageMeta | null): void {
  const key = useMemo(() => {
    if (!meta) {
      return '';
    }
    return [meta.title, meta.description, meta.image, meta.path, meta.siteName].join('|');
  }, [meta]);

  useEffect(() => {
    if (!meta) {
      return;
    }
    applyPageMeta(meta);
  }, [key, meta]);
}
