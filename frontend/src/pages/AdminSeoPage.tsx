import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminSeoFieldsEditor } from '@/components/admin/AdminSeoFieldsEditor';
import { adminApi, contentApi } from '@/lib/api';
import { readAdminToken } from '@/lib/adminAuth';
import { notifyAdminSiteSettingsUpdated } from '@/lib/adminEvents';
import { normalizeSeoDefaults } from '@/lib/seoMeta';
import { resolveMediaSrc } from '@/lib/mediaUrl';
import { useAdminToast } from '@/context/AdminToastContext';
import { categoryAdminBase } from '@/lib/adminCategoryNav';
import { emptySeoFields, normalizeSeoFields, type SeoFields } from '@/types/seo';
import type { Category, Settings } from '@/types/api';

export function AdminSeoPage() {
  const token = readAdminToken();
  const toast = useAdminToast();
  const [defaults, setDefaults] = useState<SeoFields>(emptySeoFields);
  const [homeSeo, setHomeSeo] = useState<SeoFields>(emptySeoFields);
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteName, setSiteName] = useState('Dubai Blooms');
  const [tagline, setTagline] = useState('');
  const [logo, setLogo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [settings, cats] = await Promise.all([contentApi.settings(), contentApi.categories()]);
        setSiteName(settings?.siteName?.trim() || 'Dubai Blooms');
        setTagline(settings?.tagline?.trim() || '');
        setLogo(settings?.logo?.trim() || '');
        setDefaults(normalizeSeoDefaults(settings?.seoDefaults));
        setHomeSeo(normalizeSeoFields(settings?.pageSeo?.home));
        setCategories(cats);
      } catch {
        toast('error', 'Unable to load SEO settings.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [toast]);

  if (!token) {
    return null;
  }

  const onSaveSiteAndHome = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<Settings> = {
        seoDefaults: normalizeSeoFields(defaults),
        pageSeo: { home: normalizeSeoFields(homeSeo) },
      };
      const updated = await adminApi.updateSettings(payload, token);
      setDefaults(normalizeSeoDefaults(updated.seoDefaults));
      setHomeSeo(normalizeSeoFields(updated.pageSeo?.home));
      toast('success', 'SEO settings saved.');
      notifyAdminSiteSettingsUpdated();
    } catch {
      toast('error', 'Could not save SEO settings.');
    } finally {
      setSaving(false);
    }
  };

  const previewTitle = (defaults.metaTitle || '').trim() || siteName;
  const previewImage = resolveMediaSrc((defaults.ogImage || '').trim());

  return (
    <div className="admin-app-panel">
      <div className="admin-screen-intro">
        <h1 className="admin-screen-title">SEO</h1>
        <p className="lede admin-screen-lede">
          Manage search and social meta for the homepage, site-wide fallbacks, category pages, and individual stories.
        </p>
      </div>

      {loading ? <div className="status-banner">Loading SEO settings…</div> : null}

      {!loading ? (
        <>
          <form className="admin-card admin-card-wide admin-seo-form" onSubmit={(e) => void onSaveSiteAndHome(e)}>
            <h2 className="admin-home-block-title" style={{ marginTop: 0 }}>
              Site-wide defaults
            </h2>
            <p className="lede admin-hint">
              Fallback meta for any page that does not set its own SEO — including category and story pages when their
              fields are left blank.
            </p>
            <AdminSeoFieldsEditor
              value={defaults}
              onChange={setDefaults}
              placeholders={{
                metaTitle: siteName,
                metaDescription: tagline || 'Short site summary for search results.',
              }}
            />
            <div className="admin-seo-preview-card">
              <p className="admin-seo-preview-label">Default preview</p>
              <p className="admin-seo-preview-title">{previewTitle}</p>
              <p className="admin-seo-preview-desc">
                {String(defaults.metaDescription ?? '').trim() ||
                  'Your default description will appear here in search and social previews.'}
              </p>
              {previewImage ? (
                <div className="admin-seo-preview-image" style={{ marginTop: '0.5rem' }}>
                  <img src={previewImage} alt="" />
                </div>
              ) : null}
            </div>

            <h2 className="admin-home-block-title">Homepage</h2>
            <p className="lede admin-hint">
              SEO for <code>/</code>. Leave fields blank to use site defaults or homepage content.
            </p>
            <AdminSeoFieldsEditor
              value={homeSeo}
              onChange={setHomeSeo}
              placeholders={{
                metaTitle: siteName,
                metaDescription: tagline,
                ogImage: logo,
                canonicalPath: '/',
              }}
            />

            <button className="admin-save" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save site & homepage SEO'}
            </button>
          </form>

          <section className="admin-card admin-card-wide" style={{ marginTop: '1.25rem' }}>
            <h2 className="admin-home-block-title" style={{ marginTop: 0 }}>
              Category pages
            </h2>
            <p className="lede admin-hint">
              Each category listing at <code>/…</code> has its own SEO section on the category info page.
            </p>
            {categories.length === 0 ? (
              <div className="status-banner">No categories yet.</div>
            ) : (
              <ul className="admin-seo-page-list">
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <div className="admin-seo-page-list-copy">
                      <strong>{cat.name}</strong>
                      <span>
                        <code>/{cat.slug}</code>
                      </span>
                    </div>
                    <Link className="admin-story-media-btn" to={`${categoryAdminBase(cat.slug)}/info#seo`}>
                      Edit SEO
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="admin-card admin-card-wide" style={{ marginTop: '1.25rem' }}>
            <h2 className="admin-home-block-title" style={{ marginTop: 0 }}>
              Story pages
            </h2>
            <p className="lede admin-hint">
              Per-story SEO (including advanced options) is on each story card under{' '}
              <Link to="/admin/pages/categories">Categories → Stories</Link> or homepage story sections.
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}
