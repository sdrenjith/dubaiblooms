import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useSiteData } from '@/hooks/useSiteData';
import { resolvePageMeta } from '@/lib/seoMeta';

export function NotFoundPage() {
  const { settings } = useSiteData();

  const pageMeta = useMemo(() => {
    const siteName = settings?.siteName || 'Dubai Blooms';
    return resolvePageMeta(
      { metaTitle: `Page not found — ${siteName}`, noIndex: true },
      { title: 'Page not found', description: settings?.tagline || '' },
      settings?.seoDefaults,
      siteName,
      '/404'
    );
  }, [settings]);

  usePageMeta(pageMeta);

  return (
    <div className="page-wrap section">
      <h1 className="section-title">The page cannot be found.</h1>
      <p>Return to the homepage to continue exploring the latest editorial stories.</p>
      <Link className="button-link" to="/">
        Back to Home
      </Link>
    </div>
  );
}
