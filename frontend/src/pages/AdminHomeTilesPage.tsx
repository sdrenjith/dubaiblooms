import { FormEvent, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAdminHomeOutlet } from '@/pages/AdminHomeLayout';
import type { Settings } from '@/types/api';

export function AdminHomeTilesPage() {
  const { form, setForm, saving, persist, clearStatus } = useAdminHomeOutlet();

  const updateHomepage = useCallback(
    (homepage: Partial<NonNullable<Settings['homepage']>>) => {
      clearStatus();
      setForm((prev) => ({
        ...prev,
        homepage: { ...prev.homepage, ...homepage },
      }));
    },
    [setForm, clearStatus]
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await persist();
  };

  const tiles = form.homepage?.categoryTiles || [];

  return (
    <>
      <nav className="admin-home-crumb">
        <Link to="/admin/pages/home">← Homepage overview</Link>
      </nav>
      <div className="admin-screen-intro">
        <h1 className="admin-screen-title">Topic tiles</h1>
        <p className="lede admin-screen-lede">Each card matches one row on the public homepage. Slugs must match category URLs.</p>
      </div>
      <form className="admin-tiles-editor" onSubmit={onSubmit}>
        <div className="admin-tiles-grid">
          {tiles.map((tile, idx) => (
            <article className="admin-tile-card" key={`${tile.slug}-${idx}`}>
              <span className="admin-tile-card-accent" aria-hidden />
              <header className="admin-tile-card-header">
                <span className="admin-tile-card-index">{String(idx + 1).padStart(2, '0')}</span>
                <span className="admin-tile-card-eyebrow">Topic tile</span>
              </header>
              <div className="admin-tile-card-fields">
                <label className="admin-tile-field">
                  Title
                  <input
                    type="text"
                    autoComplete="off"
                    value={tile.title}
                    onChange={(e) => {
                      const next = [...tiles];
                      next[idx] = { ...next[idx], title: e.target.value };
                      updateHomepage({ categoryTiles: next });
                    }}
                  />
                </label>
                <label className="admin-tile-field">
                  Subtitle
                  <input
                    type="text"
                    autoComplete="off"
                    value={tile.subtitle}
                    onChange={(e) => {
                      const next = [...tiles];
                      next[idx] = { ...next[idx], subtitle: e.target.value };
                      updateHomepage({ categoryTiles: next });
                    }}
                  />
                </label>
                <label className="admin-tile-field">
                  Category slug
                  <input
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    className="admin-tile-slug-input"
                    value={tile.slug}
                    onChange={(e) => {
                      const next = [...tiles];
                      next[idx] = { ...next[idx], slug: e.target.value };
                      updateHomepage({ categoryTiles: next });
                    }}
                  />
                </label>
              </div>
              <footer className="admin-tile-card-footer">
                <button
                  type="button"
                  className="admin-tile-remove"
                  onClick={() => {
                    const next = [...tiles];
                    next.splice(idx, 1);
                    updateHomepage({ categoryTiles: next });
                  }}
                >
                  Remove tile
                </button>
              </footer>
            </article>
          ))}
        </div>
        <div className="admin-tiles-footer">
          <button
            type="button"
            className="admin-tiles-btn-secondary"
            onClick={() =>
              updateHomepage({
                categoryTiles: [...tiles, { title: '', subtitle: '', slug: '' }],
              })
            }
          >
            Add tile
          </button>
          <button className="admin-tiles-btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save tiles'}
          </button>
        </div>
      </form>
    </>
  );
}
