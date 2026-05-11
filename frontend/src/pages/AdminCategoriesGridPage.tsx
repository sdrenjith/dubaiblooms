import axios from 'axios';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminApi, contentApi } from '@/lib/api';
import { notifyAdminCategoriesUpdated } from '@/lib/adminEvents';
import type { Category } from '@/types/api';
import styles from './AdminCategoriesGridPage.module.css';

type RowState = {
  name: string;
  description: string;
  image: string;
  order: number;
  showInMainMenu: boolean;
};

function rowFromCategory(c: Category): RowState {
  return {
    name: c.name,
    description: c.description || '',
    image: c.image || '',
    order: typeof c.order === 'number' ? c.order : 0,
    showInMainMenu: c.showInMainMenu !== false,
  };
}

export function AdminCategoriesGridPage() {
  const token = localStorage.getItem('adminToken');
  const location = useLocation();
  const [list, setList] = useState<Category[]>([]);
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [flash, setFlash] = useState<Record<string, string | null>>({});
  const [rowError, setRowError] = useState<Record<string, string | null>>({});
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newOrder, setNewOrder] = useState(0);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createFlash, setCreateFlash] = useState<string | null>(null);
  const [newShowInMainMenu, setNewShowInMainMenu] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const categories = await contentApi.categories();
      setList(categories);
      setRows(
        Object.fromEntries(categories.map((c) => [c._id, rowFromCategory(c)]))
      );
    } catch {
      setLoadError('Unable to load categories.');
      setList([]);
      setRows({});
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const raw = location.hash.replace(/^#/, '');
    if (!raw.startsWith('admin-cat-')) {
      return;
    }
    const t = window.setTimeout(() => {
      document.getElementById(raw)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => window.clearTimeout(t);
  }, [location.hash, list, loading]);

  if (!token) {
    return null;
  }

  const patchRow = (id: string, patch: Partial<RowState>) => {
    setRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  };

  const onSaveCard = async (event: FormEvent, category: Category) => {
    event.preventDefault();
    const row = rows[category._id];
    if (!row) {
      return;
    }
    setSavingId(category._id);
    setRowError((e) => ({ ...e, [category._id]: null }));
    setFlash((f) => ({ ...f, [category._id]: null }));
    try {
      const updated = await adminApi.updateCategory(
        category._id,
        {
          name: row.name.trim(),
          description: row.description,
          image: row.image.trim(),
          order: row.order,
          showInMainMenu: row.showInMainMenu,
        },
        token
      );
      setList((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      setRows((prev) => ({
        ...prev,
        [updated._id]: rowFromCategory(updated),
      }));
      setFlash((f) => ({ ...f, [category._id]: 'Saved.' }));
      window.setTimeout(() => {
        setFlash((f) => ({ ...f, [category._id]: null }));
      }, 2200);
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data.message === 'string'
          ? err.response.data.message
          : 'Save failed.';
      setRowError((e) => ({ ...e, [category._id]: msg }));
    } finally {
      setSavingId(null);
    }
  };

  const onCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      return;
    }
    const name = newName.trim();
    if (!name) {
      setCreateError('Name is required.');
      return;
    }
    setCreating(true);
    setCreateError(null);
    setCreateFlash(null);
    try {
      await adminApi.createCategory(
        {
          name,
          description: newDescription.trim(),
          order: Number.isFinite(newOrder) ? newOrder : 0,
          showInMainMenu: newShowInMainMenu,
        },
        token
      );
      setNewName('');
      setNewDescription('');
      setNewOrder(0);
      setNewShowInMainMenu(false);
      setCreateFlash('Category created. Add story cards from its Stories page in the sidebar.');
      await refresh();
      notifyAdminCategoriesUpdated();
      window.setTimeout(() => setCreateFlash(null), 5000);
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data.message === 'string'
          ? err.response.data.message
          : 'Could not create category.';
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={`admin-app-panel ${styles.page}`}>
      <div className={styles.intro}>
        <h1 className="admin-screen-title">Categories</h1>
        <p className="lede admin-screen-lede">
          New categories stay off the public header and footer until you turn on <strong>Show in main menu</strong>. Desks stay available at{' '}
          <code>/category/…</code> and in the admin sidebar either way.
        </p>
        <p className="lede admin-hint" style={{ marginTop: '0.35rem' }}>
          <button className="button-link" type="button" onClick={() => void refresh()} disabled={loading}>
            {loading ? 'Refreshing…' : 'Reload list'}
          </button>
        </p>
      </div>

      <section className="admin-card admin-card-wide" style={{ marginBottom: '1.25rem' }}>
        <h2 className="admin-home-block-title" style={{ marginTop: 0 }}>
          Add category
        </h2>
        <p className="lede admin-hint">
          The URL slug is generated from the name. After saving, open the category in the sidebar → <strong>Stories</strong> to add cards.
        </p>
        <form className="admin-home-section-fields" onSubmit={(e) => void onCreateCategory(e)}>
          <label>
            Name
            <input value={newName} onChange={(e) => setNewName(e.target.value)} required maxLength={120} />
          </label>
          <label>
            Sort order
            <input
              type="number"
              value={newOrder}
              onChange={(e) => setNewOrder(Number(e.target.value))}
            />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Description
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              maxLength={2000}
            />
          </label>
          <label style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={newShowInMainMenu}
              onChange={(e) => setNewShowInMainMenu(e.target.checked)}
            />
            Show in main menu (header + footer category links)
          </label>
          {createError ? <p className="status-banner">{createError}</p> : null}
          {createFlash ? <p className="status-banner">{createFlash}</p> : null}
          <button className="admin-save" type="submit" disabled={creating} style={{ gridColumn: '1 / -1' }}>
            {creating ? 'Creating…' : 'Create category'}
          </button>
        </form>
      </section>
      {loadError ? <div className="status-banner">{loadError}</div> : null}
      {loading ? <div className="status-banner">Loading categories…</div> : null}

      {!loading && list.length === 0 ? (
        <p className="lede">No categories yet. Run seed or add categories in the database.</p>
      ) : null}

      {!loading && list.length > 0 ? (
        <div className={styles.grid}>
          {list.map((category) => {
            const row = rows[category._id] ?? rowFromCategory(category);
            const busy = savingId === category._id;
            return (
              <form
                key={category._id}
                id={`admin-cat-${category.slug}`}
                className={styles.card}
                onSubmit={(e) => void onSaveCard(e, category)}
              >
                <div className={styles.cardHead}>
                  <div>
                    <h2 className={styles.cardTitle}>{category.name}</h2>
                    <p className={styles.cardSlug}>/category/{category.slug}</p>
                    <p className={styles.cardNavBadge}>
                      {(row.showInMainMenu ? 'Shown' : 'Hidden') + ' in main menu'}
                    </p>
                  </div>
                </div>
                <div className={styles.fieldGrid}>
                  <label>
                    Name
                    <input
                      value={row.name}
                      onChange={(e) => patchRow(category._id, { name: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Sort order
                    <input
                      type="number"
                      value={row.order}
                      onChange={(e) => patchRow(category._id, { order: Number(e.target.value) })}
                    />
                  </label>
                  <label>
                    Cover image URL
                    <input
                      value={row.image}
                      onChange={(e) => patchRow(category._id, { image: e.target.value })}
                      placeholder="https://…"
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={row.description}
                      onChange={(e) => patchRow(category._id, { description: e.target.value })}
                      rows={3}
                    />
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={row.showInMainMenu}
                      onChange={(e) => patchRow(category._id, { showInMainMenu: e.target.checked })}
                    />
                    Show in main menu (header and footer navigation)
                  </label>
                </div>
                {flash[category._id] ? <p className={styles.cardMessage}>{flash[category._id]}</p> : null}
                {rowError[category._id] ? <p className={styles.cardError}>{rowError[category._id]}</p> : null}
                <div className={styles.cardActions}>
                  <button className={styles.saveBtn} type="submit" disabled={busy}>
                    {busy ? 'Saving…' : 'Save'}
                  </button>
                  <Link className={styles.viewLink} to={`/admin/pages/category/${category.slug}`}>
                    Admin page →
                  </Link>
                  <Link className={styles.viewLink} to={`/category/${category.slug}`} target="_blank" rel="noreferrer">
                    View public page →
                  </Link>
                </div>
              </form>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
