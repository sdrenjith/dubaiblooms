import { FormEvent, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAdminHomeOutlet } from '@/pages/AdminHomeLayout';
import type { Settings } from '@/types/api';

export function AdminHomeReviewsPage() {
  const { form, setForm, saving, message, error, persist, clearStatus } = useAdminHomeOutlet();

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

  const reviews = form.homepage?.googleReviews || [];

  return (
    <>
      <nav className="admin-home-crumb">
        <Link to="/admin/pages/home">← Homepage overview</Link>
      </nav>
      <div className="admin-screen-intro">
        <h1 className="admin-screen-title">Testimonial library</h1>
        <p className="lede admin-screen-lede">Testimonials used in homepage review blocks. Edit each card below, then save.</p>
      </div>
      {message ? <div className="status-banner">{message}</div> : null}
      {error ? <div className="status-banner">{error}</div> : null}

      <form className="admin-tiles-editor" onSubmit={onSubmit}>
        <div className="admin-tiles-grid">
          {reviews.map((review, idx) => (
            <article className="admin-tile-card" key={`review-${idx}`}>
              <span className="admin-tile-card-accent" aria-hidden />
              <header className="admin-tile-card-header">
                <span className="admin-tile-card-index">{String(idx + 1).padStart(2, '0')}</span>
                <span className="admin-tile-card-eyebrow">Testimonial</span>
              </header>
              <div className="admin-tile-card-fields">
                <label className="admin-tile-field">
                  Author
                  <input
                    type="text"
                    autoComplete="off"
                    value={review.author}
                    onChange={(e) => {
                      const next = [...reviews];
                      next[idx] = { ...next[idx], author: e.target.value };
                      updateHomepage({ googleReviews: next });
                    }}
                  />
                </label>
                <label className="admin-tile-field">
                  Rating (1–5)
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={review.rating}
                    onChange={(e) => {
                      const next = [...reviews];
                      next[idx] = { ...next[idx], rating: Number(e.target.value || 5) };
                      updateHomepage({ googleReviews: next });
                    }}
                  />
                </label>
                <label className="admin-tile-field">
                  Review text
                  <textarea
                    value={review.review}
                    rows={4}
                    onChange={(e) => {
                      const next = [...reviews];
                      next[idx] = { ...next[idx], review: e.target.value };
                      updateHomepage({ googleReviews: next });
                    }}
                  />
                </label>
                <label className="admin-tile-field">
                  Location
                  <input
                    type="text"
                    autoComplete="off"
                    value={review.location}
                    onChange={(e) => {
                      const next = [...reviews];
                      next[idx] = { ...next[idx], location: e.target.value };
                      updateHomepage({ googleReviews: next });
                    }}
                  />
                </label>
                <label className="admin-tile-field">
                  Posted at
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="e.g. 2 weeks ago"
                    value={review.postedAt}
                    onChange={(e) => {
                      const next = [...reviews];
                      next[idx] = { ...next[idx], postedAt: e.target.value };
                      updateHomepage({ googleReviews: next });
                    }}
                  />
                </label>
              </div>
              <footer className="admin-tile-card-footer">
                <button
                  type="button"
                  className="admin-tile-remove"
                  onClick={() => {
                    const next = [...reviews];
                    next.splice(idx, 1);
                    updateHomepage({ googleReviews: next });
                  }}
                >
                  Remove review
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
                googleReviews: [...reviews, { author: '', rating: 5, review: '', location: '', postedAt: '' }],
              })
            }
          >
            Add review
          </button>
          <button className="admin-tiles-btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save reviews'}
          </button>
        </div>
      </form>
    </>
  );
}
