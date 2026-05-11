import { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AdminCategorySlugSelect } from '@/components/admin/AdminCategorySlugSelect';
import { useAdminCategoriesList } from '@/hooks/useAdminCategoriesList';
import { useAdminHomeOutlet } from '@/pages/AdminHomeLayout';
import type { Settings } from '@/types/api';

type HomepageSection = NonNullable<NonNullable<Settings['homepage']>['sections']>[number];

function newSectionId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `section-${Date.now()}`;
}

/** Default-shaped row for the sections list editor. */
function createBlankSection(patch: Partial<HomepageSection> = {}): HomepageSection {
  return {
    id: newSectionId(),
    title: '',
    subtitle: '',
    source: 'latest',
    categorySlug: '',
    limit: 6,
    ...patch,
  };
}

export function AdminHomeSectionsManagePage() {
  const { form, setForm, saving, message, error, persist, clearStatus } = useAdminHomeOutlet();
  const sections = form.homepage?.sections || [];
  const { categories: categoryOptions, loading: categoriesLoading, error: categoriesError } = useAdminCategoriesList();

  const updateHomepage = (homepage: Partial<NonNullable<Settings['homepage']>>) => {
    clearStatus();
    setForm((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, ...homepage },
    }));
  };

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= sections.length) {
      return;
    }
    const next = [...sections];
    [next[index], next[j]] = [next[j], next[index]];
    updateHomepage({ sections: next });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await persist();
  };

  return (
    <>
      <nav className="admin-home-crumb">
        <Link to="/admin/pages/home">← Homepage overview</Link>
      </nav>
      <div className="admin-screen-intro">
        <h1 className="admin-screen-title">Sections & order</h1>
        <p className="lede admin-screen-lede">
          Reorder blocks as they appear on the homepage. Open a section title in the sidebar to edit copy and preview stories.
          For category-driven grids, choose the desk from the list (from <Link to="/admin/pages/categories">Categories</Link>).{' '}
          Add story cards under <strong>Sidebar → Category name → Stories</strong>.
        </p>
      </div>
      {categoriesLoading ? <div className="status-banner">Loading category list…</div> : null}
      {categoriesError ? <div className="status-banner">{categoriesError}</div> : null}
      {message ? <div className="status-banner">{message}</div> : null}
      {error ? <div className="status-banner">{error}</div> : null}

      <form onSubmit={onSubmit}>
        <div className="admin-home-manage-list">
          {sections.map((section, idx) => (
            <div className="admin-card admin-card-wide admin-home-manage-row" key={`${section.id}-${idx}`}>
              <div className="admin-home-manage-head">
                <h2>{section.title?.trim() || section.id || `Section ${idx + 1}`}</h2>
                <Link className="button-link" to={`/admin/pages/home/sections/${idx}`}>
                  Edit details →
                </Link>
              </div>
              <div className="admin-row admin-home-sections-row">
                <input
                  placeholder="Title"
                  value={section.title}
                  onChange={(e) => {
                    const next = [...sections];
                    next[idx] = { ...next[idx], title: e.target.value };
                    updateHomepage({ sections: next });
                  }}
                />
                <input
                  placeholder="Subtitle"
                  value={section.subtitle}
                  onChange={(e) => {
                    const next = [...sections];
                    next[idx] = { ...next[idx], subtitle: e.target.value };
                    updateHomepage({ sections: next });
                  }}
                />
                <select
                  value={section.source}
                  onChange={(e) => {
                    const next = [...sections];
                    next[idx] = {
                      ...next[idx],
                      source: e.target.value as 'featured' | 'latest' | 'category' | 'reviews',
                    };
                    updateHomepage({ sections: next });
                  }}
                >
                  <option value="featured">featured</option>
                  <option value="latest">latest</option>
                  <option value="category">category</option>
                  <option value="reviews">reviews</option>
                </select>
                {section.source === 'category' ? (
                  <AdminCategorySlugSelect
                    id={`homepage-section-category-${idx}`}
                    categories={categoryOptions}
                    value={section.categorySlug || ''}
                    disabled={false}
                    onChange={(slug) => {
                      const next = [...sections];
                      next[idx] = { ...next[idx], categorySlug: slug };
                      updateHomepage({ sections: next });
                    }}
                  />
                ) : (
                  <input
                    placeholder="Category (set type → category)"
                    value=""
                    disabled
                    readOnly
                    aria-disabled
                  />
                )}
                <input
                  type="number"
                  min={1}
                  placeholder="Limit"
                  value={section.limit}
                  onChange={(e) => {
                    const next = [...sections];
                    next[idx] = { ...next[idx], limit: Number(e.target.value || 6) };
                    updateHomepage({ sections: next });
                  }}
                />
                <div className="admin-home-reorder">
                  <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0}>
                    Up
                  </button>
                  <button type="button" onClick={() => move(idx, 1)} disabled={idx === sections.length - 1}>
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...sections];
                      next.splice(idx, 1);
                      updateHomepage({ sections: next });
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="admin-home-actions-row admin-home-actions-row--sections">
          <button
            type="button"
            className="admin-save"
            onClick={() => {
              updateHomepage({
                sections: [...sections, createBlankSection()],
              });
            }}
          >
            Add section
          </button>
          <button
            type="button"
            className="admin-save"
            onClick={() => {
              updateHomepage({
                sections: [...sections, createBlankSection({ source: 'category', categorySlug: '' })],
              });
            }}
          >
            Add category
          </button>
          <button className="admin-save admin-home-save-submit" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save order & sections'}
          </button>
        </div>
      </form>
    </>
  );
}
