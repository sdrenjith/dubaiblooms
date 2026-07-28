import axios from 'axios';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminApi, contentApi } from '@/lib/api';
import { useAdminConfirm } from '@/context/AdminConfirmContext';
import { useAdminToast } from '@/context/AdminToastContext';
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
  const toast = useAdminToast();
  const askConfirm = useAdminConfirm();
  const location = useLocation();
  const [list, setList] = useState<Category[]>([]);
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [storyCountByCategory, setStoryCountByCategory] = useState<Record<string, number>>({});
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newOrder, setNewOrder] = useState(0);
  const [creating, setCreating] = useState(false);
  const [newShowInMainMenu, setNewShowInMainMenu] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const categories = await contentApi.categories();
      setList(categories);
      setRows(
        Object.fromEntries(categories.map((c) => [c._id, rowFromCategory(c)]))
      );
      try {
        const articles = await adminApi.listArticlesAdmin(token, 500);
        const counts: Record<string, number> = {};
        for (const article of articles) {
          const categoryId = article.category?._id;
          if (categoryId) {
            counts[categoryId] = (counts[categoryId] ?? 0) + 1;
          }
        }
        setStoryCountByCategory(counts);
      } catch {
        setStoryCountByCategory({});
      }
    } catch {
      toast('error', 'Unable to load categories.');
      setList([]);
      setRows({});
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

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
      toast('success', `Saved: ${row.name.trim() || category.name}.`);
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data.message === 'string'
          ? err.response.data.message
          : 'Save failed.';
      toast('error', `${row.name.trim() || category.name}: ${msg}`);
    } finally {
      setSavingId(null);
    }
  };

  const onDeleteCategory = async (category: Category) => {
    if (!token) {
      return;
    }
    const storyCount = storyCountByCategory[category._id] ?? 0;
    if (storyCount > 0) {
      toast(
        'error',
        `${storyCount} ${storyCount === 1 ? 'story' : 'stories'} — delete stories before removing this category. Open Sidebar → ${category.name} → Stories.`
      );
      return;
    }
    const confirmed = await askConfirm({
      title: 'Delete category',
      message: `“${category.name}” and its admin settings will be removed permanently. This cannot be undone.`,
      confirmLabel: 'Delete category',
      variant: 'danger',
    });
    if (!confirmed) {
      return;
    }
    setDeletingId(category._id);
    try {
      await adminApi.deleteCategory(category._id, token);
      toast('success', `Category “${category.name}” deleted.`);
      notifyAdminCategoriesUpdated();
      await refresh();
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data.message === 'string'
          ? err.response.data.message
          : 'Could not delete category.';
      toast('error', msg);
    } finally {
      setDeletingId(null);
    }
  };

  const onCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      return;
    }
    const name = newName.trim();
    if (!name) {
      toast('error', 'Name is required.');
      return;
    }
    setCreating(true);
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
      toast('success', 'Category created. Add story cards from its Stories page in the sidebar.');
      await refresh();
      notifyAdminCategoriesUpdated();
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data.message === 'string'
          ? err.response.data.message
          : 'Could not create category.';
      toast('error', msg);
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
          <code>/…</code> and in the admin sidebar either way.
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
          <button className="admin-save" type="submit" disabled={creating} style={{ gridColumn: '1 / -1' }}>
            {creating ? 'Creating…' : 'Create category'}
          </button>
        </form>
      </section>
      {loading ? <div className="status-banner">Loading categories…</div> : null}

      {!loading && list.length === 0 ? (
        <p className="lede">No categories yet. Run seed or add categories in the database.</p>
      ) : null}

      {!loading && list.length > 0 ? (
        <div className={styles.grid}>
          {list.map((category) => {
            const row = rows[category._id] ?? rowFromCategory(category);
            const busy = savingId === category._id;
            const isDeleting = deletingId === category._id;
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
                    <p className={styles.cardSlug}>/{category.slug}</p>
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
                <div className={styles.cardActions}>
                  <button
                    className="admin-story-action-btn admin-story-action-primary"
                    type="submit"
                    disabled={busy || isDeleting}
                  >
                    {busy ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="admin-story-action-btn admin-story-action-danger"
                    disabled={isDeleting || busy}
                    onClick={() => void onDeleteCategory(category)}
                  >
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </button>
                  <Link
                    className="admin-story-action-btn admin-story-action-secondary"
                    to={`/admin/pages/category/${category.slug}`}
                  >
                    Admin page
                  </Link>
                  <Link
                    className={`admin-story-action-btn admin-story-action-secondary ${styles.cardActionFull}`}
                    to={`/${category.slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View public page
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
