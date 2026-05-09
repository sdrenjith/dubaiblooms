import { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet, useOutletContext, useParams } from 'react-router-dom';
import { contentApi } from '@/lib/api';
import type { Category } from '@/types/api';

export type AdminCategoryOutletContext = {
  category: Category;
  token: string;
  refreshCategory: () => Promise<void>;
};

export function useAdminCategoryOutlet(): AdminCategoryOutletContext {
  return useOutletContext<AdminCategoryOutletContext>();
}

export function AdminCategoryLayout() {
  const { slug = '' } = useParams();
  const token = localStorage.getItem('adminToken') || '';
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setMissing(false);
      try {
        const list = await contentApi.categories();
        const found = list.find((c) => c.slug === slug);
        if (cancelled) {
          return;
        }
        if (found) {
          setCategory(found);
        } else {
          setCategory(null);
          setMissing(true);
        }
      } catch {
        if (!cancelled) {
          setCategory(null);
          setMissing(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const refreshCategory = useCallback(async () => {
    try {
      const list = await contentApi.categories();
      const found = list.find((c) => c.slug === slug);
      if (found) {
        setCategory(found);
      }
    } catch {
      /* keep existing category */
    }
  }, [slug]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (loading) {
    return (
      <div className="admin-app-panel">
        <div className="status-banner">Loading category…</div>
      </div>
    );
  }

  if (missing || !category) {
    return <Navigate to="/admin/pages/categories" replace />;
  }

  const contextValue: AdminCategoryOutletContext = {
    category,
    token,
    refreshCategory,
  };

  return (
    <div className="admin-app-panel">
      <Outlet context={contextValue} />
    </div>
  );
}
