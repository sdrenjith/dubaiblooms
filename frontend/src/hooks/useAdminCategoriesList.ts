import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { contentApi } from '@/lib/api';
import { ADMIN_CATEGORIES_UPDATED } from '@/lib/adminEvents';
import type { Category } from '@/types/api';

function sortCats(list: Category[]): Category[] {
  return [...list].sort((a, b) => {
    const oa = typeof a.order === 'number' ? a.order : 0;
    const ob = typeof b.order === 'number' ? b.order : 0;
    if (oa !== ob) {
      return oa - ob;
    }
    return a.name.localeCompare(b.name);
  });
}

export function useAdminCategoriesList(): {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await contentApi.categories();
      setCategories(sortCats(list));
    } catch (e) {
      const msg =
        axios.isAxiosError(e) && e.response?.data && typeof e.response.data.message === 'string'
          ? e.response.data.message
          : 'Could not load categories.';
      setError(msg);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => {
      void refresh();
    };
    window.addEventListener(ADMIN_CATEGORIES_UPDATED, onUpdate);
    return () => window.removeEventListener(ADMIN_CATEGORIES_UPDATED, onUpdate);
  }, [refresh]);

  return { categories, loading, error, refresh };
}
