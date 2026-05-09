import { useEffect, useState } from 'react';
import { contentApi } from '@/lib/api';
import type { Category, Settings } from '@/types/api';

interface SiteDataState {
  settings: Settings | null;
  categories: Category[];
  loading: boolean;
}

type SiteDataBundle = { settings: Settings | null; categories: Category[] };

let siteDataInflight: Promise<SiteDataBundle> | null = null;

function loadSiteDataOnce(): Promise<SiteDataBundle> {
  if (!siteDataInflight) {
    siteDataInflight = Promise.all([contentApi.settings(), contentApi.categories()])
      .then(([settings, categories]) => ({ settings, categories }))
      .catch(() => ({ settings: null, categories: [] }))
      .finally(() => {
        siteDataInflight = null;
      });
  }
  return siteDataInflight;
}

export function useSiteData(): SiteDataState {
  const [state, setState] = useState<SiteDataState>({
    settings: null,
    categories: [],
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const { settings, categories } = await loadSiteDataOnce();
      if (isMounted) {
        setState({ settings, categories, loading: false });
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
