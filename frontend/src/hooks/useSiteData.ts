import { useEffect, useState } from 'react';
import { contentApi } from '@/lib/api';
import type { Category, Settings } from '@/types/api';

interface SiteDataState {
  settings: Settings | null;
  categories: Category[];
  loading: boolean;
}

export function useSiteData(): SiteDataState {
  const [state, setState] = useState<SiteDataState>({
    settings: null,
    categories: [],
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [settings, categories] = await Promise.all([contentApi.settings(), contentApi.categories()]);
        if (isMounted) {
          setState({ settings, categories, loading: false });
        }
      } catch {
        if (isMounted) {
          setState({ settings: null, categories: [], loading: false });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
