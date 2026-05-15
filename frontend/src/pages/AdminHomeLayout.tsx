import axios from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { adminApi, contentApi } from '@/lib/api';
import { useAdminToast } from '@/context/AdminToastContext';
import {
  headerBarOnly,
  normalizeHeroCardsFromHomepage,
  sanitizeHomepageForPersist,
} from '@/lib/homepageHero';
import type { Settings } from '@/types/api';

function loadHomepageErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return 'Unable to load homepage settings (network error). Start the API server and ensure CORS allows this dev URL, or use the Vite dev server proxy (leave VITE_API_URL unset).';
    }
    const msg = typeof err.response?.data === 'object' && err.response.data && 'message' in err.response.data
      ? String((err.response.data as { message?: string }).message)
      : err.message;
    return `Unable to load homepage settings: ${msg}`;
  }
  if (err instanceof Error) {
    return `Unable to load homepage settings: ${err.message}`;
  }
  return 'Unable to load homepage settings.';
}

const emptyHomeSlice: Pick<Settings, 'listing' | 'homepage'> = {
  listing: { cardsPerPage: 4 },
  homepage: {
    heroAutoplayMs: 5000,
    categoryTiles: [],
    sections: [],
    googleReviews: [],
    heroCards: [],
  },
};

/** Align API homepage with admin form (same as GET load) so marquee/header/cards stay consistent after save. */
function mergeHomepageFromApi(hp?: Settings['homepage']): Settings['homepage'] {
  return {
    ...emptyHomeSlice.homepage,
    ...hp,
    header: headerBarOnly(hp?.header),
    heroCards: normalizeHeroCardsFromHomepage(hp),
  };
}

export type AdminHomeOutletContext = {
  form: Pick<Settings, 'listing' | 'homepage'>;
  setForm: React.Dispatch<React.SetStateAction<Pick<Settings, 'listing' | 'homepage'>>>;
  loading: boolean;
  saving: boolean;
  persist: () => Promise<void>;
  clearStatus: () => void;
  token: string;
};

export function useAdminHomeOutlet(): AdminHomeOutletContext {
  return useOutletContext<AdminHomeOutletContext>();
}

export function AdminHomeLayout() {
  const token = localStorage.getItem('adminToken') || '';
  const toast = useAdminToast();
  const [form, setForm] = useState<Pick<Settings, 'listing' | 'homepage'>>(emptyHomeSlice);
  const formRef = useRef(form);
  formRef.current = form;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const settings = await contentApi.settings();
        if (cancelled) {
          return;
        }
        setForm({
          listing: settings?.listing || emptyHomeSlice.listing,
          homepage: mergeHomepageFromApi(settings?.homepage),
        });
      } catch (err) {
        if (!cancelled) {
          toast('error', loadHomepageErrorMessage(err));
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
  }, [toast]);

  const clearStatus = useCallback(() => {}, []);

  const persist = useCallback(async () => {
    if (!token) {
      toast('error', 'Your session expired. Sign in again to save.');
      return;
    }
    const latest = formRef.current;
    setSaving(true);
    try {
      const payload = {
        listing: latest.listing ?? emptyHomeSlice.listing,
        homepage: sanitizeHomepageForPersist(latest.homepage ?? emptyHomeSlice.homepage),
      };
      const fresh = await adminApi.updateSettings(payload, token);
      const hpMerged = fresh?.homepage ?? latest.homepage;
      const next: Pick<Settings, 'listing' | 'homepage'> = {
        listing: fresh?.listing ?? latest.listing ?? emptyHomeSlice.listing,
        homepage: mergeHomepageFromApi(hpMerged),
      };
      setForm(next);
      toast('success', 'Saved.');
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? typeof err.response?.data === 'object' &&
          err.response?.data &&
          'message' in err.response.data
          ? String((err.response.data as { message?: string }).message)
          : err.message
        : err instanceof Error
          ? err.message
          : 'Unknown error';
      toast('error', `Failed to save: ${msg}`);
    } finally {
      setSaving(false);
    }
  }, [token, toast]);

  const contextValue = useMemo<AdminHomeOutletContext>(
    () => ({
      form,
      setForm,
      loading,
      saving,
      persist,
      clearStatus,
      token,
    }),
    [form, loading, saving, persist, clearStatus, token]
  );

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (loading) {
    return (
      <div className="admin-app-panel">
        <div className="status-banner">Loading…</div>
      </div>
    );
  }

  return (
    <div className="admin-app-panel">
      <Outlet context={contextValue} />
    </div>
  );
}
