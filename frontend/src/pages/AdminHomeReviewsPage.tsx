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

      <form onSubmit={onSubmit}>
        <div className="admin-home-card-grid">
          {reviews.map((review, idx) => (
            <div className="admin-item-card" key={`${review.author}-${idx}`}>
              <p className="admin-item-card-kicker">Review {idx + 1}</p>
              <label>
                Author
                <input
                  value={review.author}
                  onChange={(e) => {
                    const next = [...reviews];
                    next[idx] = { ...next[idx], author: e.target.value };
                    updateHomepage({ googleReviews: next });
                  }}
                />
              </label>
              <label>
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
              <label>
                Review text
                <textarea
                  value={review.review}
                  onChange={(e) => {
                    const next = [...reviews];
                    next[idx] = { ...next[idx], review: e.target.value };
                    updateHomepage({ googleReviews: next });
                  }}
                />
              </label>
              <label>
                Location
                <input
                  value={review.location}
                  onChange={(e) => {
                    const next = [...reviews];
                    next[idx] = { ...next[idx], location: e.target.value };
                    updateHomepage({ googleReviews: next });
                  }}
                />
              </label>
              <label>
                Posted at
                <input
                  value={review.postedAt}
                  onChange={(e) => {
                    const next = [...reviews];
                    next[idx] = { ...next[idx], postedAt: e.target.value };
                    updateHomepage({ googleReviews: next });
                  }}
                />
              </label>
              <button
                type="button"
                className="admin-item-card-remove"
                onClick={() => {
                  const next = [...reviews];
                  next.splice(idx, 1);
                  updateHomepage({ googleReviews: next });
                }}
              >
                Remove review
              </button>
            </div>
          ))}
        </div>
        <div className="admin-home-actions-row">
          <button
            type="button"
            onClick={() =>
              updateHomepage({
                googleReviews: [...reviews, { author: '', rating: 5, review: '', location: '', postedAt: '' }],
              })
            }
          >
            Add review
          </button>
          <button className="admin-save" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save reviews'}
          </button>
        </div>
      </form>
    </>
  );
}
