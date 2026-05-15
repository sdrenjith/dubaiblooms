import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { adminApi, contentApi } from '@/lib/api';
import { AdminStoryEditorsList } from '@/components/admin/AdminStoryEditorsList';
import { AdminCategorySlugSelect } from '@/components/admin/AdminCategorySlugSelect';
import { useStoryEditors } from '@/hooks/useStoryEditors';
import { useAdminCategoriesList } from '@/hooks/useAdminCategoriesList';
import { useAdminToast } from '@/context/AdminToastContext';
import { useAdminHomeOutlet } from '@/pages/AdminHomeLayout';
import type { Article } from '@/types/api';

export function AdminHomeSectionPage() {
  const { sectionIndex } = useParams();
  const idx = Number(sectionIndex);
  const { form, setForm, clearStatus, token } = useAdminHomeOutlet();
  const toast = useAdminToast();
  const sections = form.homepage?.sections || [];
  const section = Number.isFinite(idx) && idx >= 0 && idx < sections.length ? sections[idx] : null;

  const [stories, setStories] = useState<Article[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [sectionSaving, setSectionSaving] = useState(false);

  const { categories: categoryOptions, error: categoriesLoadError } = useAdminCategoriesList();

  useEffect(() => {
    if (categoriesLoadError) {
      toast('error', categoriesLoadError);
    }
  }, [categoriesLoadError, toast]);

  const showFeatured = !!section && section.source === 'featured';
  const { editedStories, updateStoryField, saveStory, storyStatuses } = useStoryEditors(
    token,
    stories,
    showFeatured,
    (updated) => {
      setStories((prev) => prev.map((x) => (x._id === updated._id ? { ...x, ...updated } : x)));
    }
  );

  useEffect(() => {
    if (!section) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      setStoriesLoading(true);
      try {
        const limit = Math.max(1, section.limit || 6);
        if (section.source === 'featured') {
          const list = await contentApi.featured();
          if (!cancelled) {
            setStories(list.slice(0, limit));
          }
          return;
        }
        if (section.source === 'latest') {
          const list = await contentApi.latest(limit);
          if (!cancelled) {
            setStories(list);
          }
          return;
        }
        if (section.source === 'category' && section.categorySlug) {
          const { articles } = await contentApi.articlesByCategory(section.categorySlug, 1, limit);
          if (!cancelled) {
            setStories(articles);
          }
          return;
        }
        if (!cancelled) {
          setStories([]);
        }
      } catch {
        if (!cancelled) {
          toast('error', 'Could not load stories.');
          setStories([]);
        }
      } finally {
        if (!cancelled) {
          setStoriesLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [section?.id, section?.source, section?.categorySlug, section?.limit, toast]);

  if (!section) {
    return <Navigate to="/admin/pages/home" replace />;
  }

  const updateSection = (patch: Partial<(typeof sections)[number]>) => {
    clearStatus();
    const next = [...sections];
    next[idx] = { ...next[idx], ...patch };
    setForm((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, sections: next },
    }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!section) {
      return;
    }
    setSectionSaving(true);
    try {
      const updated = await adminApi.updateHomepageSection(
        idx,
        {
          title: section.title,
          subtitle: section.subtitle,
          source: section.source,
          categorySlug: section.categorySlug || '',
          limit: Number(section.limit) || 6,
        },
        token
      );
      setForm((prev) => ({
        ...prev,
        listing: updated.listing ?? prev.listing,
        homepage: updated.homepage ?? prev.homepage,
      }));
      toast('success', 'Section settings saved.');
    } catch {
      toast('error', 'Failed to save section settings. Please retry after restarting the API server.');
    } finally {
      setSectionSaving(false);
    }
  };

  const reviews = form.homepage?.googleReviews || [];
  const reviewLimit = Math.max(1, section.limit || 6);
  const reviewSlice = section.source === 'reviews' ? reviews.slice(0, reviewLimit) : [];

  return (
    <>
      <nav className="admin-home-crumb">
        <Link to="/admin/pages/home">← Homepage overview</Link>
      </nav>
      <div className="admin-screen-intro">
        <h1 className="admin-screen-title">{section.title?.trim() || section.id || 'Section'}</h1>
        <p className="lede admin-screen-lede">{section.subtitle || 'Configure this block and preview the stories shown on the site.'}</p>
      </div>

      <form onSubmit={onSubmit}>
        <section className="admin-card admin-card-wide">
          <h2>Section settings</h2>
          <div className="admin-home-section-fields">
            <label>
              Title
              <input value={section.title} onChange={(e) => updateSection({ title: e.target.value })} />
            </label>
            <label>
              Subtitle
              <input value={section.subtitle} onChange={(e) => updateSection({ subtitle: e.target.value })} />
            </label>
            <label>
              Source
              <select
                value={section.source}
                onChange={(e) =>
                  updateSection({
                    source: e.target.value as 'featured' | 'latest' | 'category' | 'reviews',
                  })
                }
              >
                <option value="featured">featured</option>
                <option value="latest">latest</option>
                <option value="category">category</option>
                <option value="reviews">reviews</option>
              </select>
            </label>
            <label className="admin-category-section-label">
              Category (homepage grid)
              {section.source === 'category' ? (
                <AdminCategorySlugSelect
                  categories={categoryOptions}
                  value={section.categorySlug || ''}
                  disabled={false}
                  onChange={(slug) => updateSection({ categorySlug: slug })}
                />
              ) : (
                <input value="" placeholder="Choose source → category" disabled readOnly aria-disabled />
              )}
              {section.source === 'category' && section.categorySlug ? (
                <span className="lede admin-hint admin-category-section-meta">
                  Add or edit cards:{' '}
                  <Link to={`/admin/pages/category/${encodeURIComponent(section.categorySlug)}/stories`}>
                    Stories for this category →
                  </Link>
                  {' · '}
                  <Link to="/admin/pages/categories">All categories →</Link>
                </span>
              ) : null}
              {section.source === 'category' && !section.categorySlug ? (
                <span className="lede admin-hint admin-category-section-meta">
                  Pick a category above. Desks live under{' '}
                  <Link to="/admin/pages/categories">Categories</Link> — add cards via each category&apos;s Stories.
                </span>
              ) : null}
            </label>
            <label>
              Limit
              <input
                type="number"
                min={1}
                value={section.limit}
                onChange={(e) => updateSection({ limit: Number(e.target.value || 6) })}
              />
            </label>
          </div>
          <button className="admin-save" type="submit" disabled={sectionSaving}>
            {sectionSaving ? 'Saving…' : 'Save section settings'}
          </button>
        </section>
      </form>

      {section.source === 'reviews' ? (
        <>
          <h2 className="admin-home-block-title">Testimonials in this block (first {reviewLimit})</h2>
          <p className="lede admin-hint">
            Text is shared across all review sections.{' '}
            <Link to="/admin/pages/home/reviews">Edit testimonial library →</Link>
          </p>
          <div className="admin-home-card-grid">
            {reviewSlice.map((review, ridx) => (
              <div className="admin-item-card admin-item-card-readonly" key={`${review.author}-${ridx}`}>
                <p className="admin-item-card-kicker">
                  {review.rating}★ · {review.postedAt}
                </p>
                <p className="admin-item-card-strong">{review.author}</p>
                <p className="admin-item-card-meta">{review.location}</p>
                <p className="admin-item-card-body">{review.review}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <AdminStoryEditorsList
          editedStories={editedStories}
          updateStoryField={updateStoryField}
          saveStory={saveStory}
          storyStatuses={storyStatuses}
          showFeaturedCheckbox={section.source === 'featured'}
          storiesLoading={storiesLoading}
          storiesError={null}
        />
      )}
    </>
  );
}
