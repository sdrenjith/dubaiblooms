import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminSeoFieldsEditor } from '@/components/admin/AdminSeoFieldsEditor';
import { adminApi } from '@/lib/api';
import { categoryAdminBase } from '@/lib/adminCategoryNav';
import { isValidSlugInput, normalizeSlugInput } from '@/lib/slug';
import { useAdminToast } from '@/context/AdminToastContext';
import { useAdminCategoryOutlet } from '@/pages/AdminCategoryLayout';
import { emptySeoFields, normalizeSeoFields, type SeoFields } from '@/types/seo';

export function AdminCategoryInfoPage() {
  const { category, token, refreshCategory } = useAdminCategoryOutlet();
  const navigate = useNavigate();
  const toast = useAdminToast();
  const base = categoryAdminBase(category.slug);
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [description, setDescription] = useState(category.description || '');
  const [image, setImage] = useState(category.image || '');
  const [order, setOrder] = useState(typeof category.order === 'number' ? category.order : 0);
  const [seo, setSeo] = useState<SeoFields>(emptySeoFields);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || '');
    setImage(category.image || '');
    setOrder(typeof category.order === 'number' ? category.order : 0);
    setSeo(normalizeSeoFields(category.seo));
  }, [category]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const normalizedSlug = normalizeSlugInput(slug);
    if (!isValidSlugInput(normalizedSlug)) {
      toast('error', 'URL slug is required. Use lowercase letters, numbers, and hyphens.');
      return;
    }
    setSaving(true);
    try {
      const updated = await adminApi.updateCategory(
        category._id,
        {
          name: name.trim(),
          slug: normalizedSlug,
          description,
          image: image.trim(),
          order,
          seo: normalizeSeoFields(seo),
        },
        token
      );
      if (updated.slug !== category.slug) {
        toast('success', 'Saved. Redirecting to updated category URL…');
        navigate(`${categoryAdminBase(updated.slug)}/info`, { replace: true });
        return;
      }
      await refreshCategory();
      toast('success', 'Saved.');
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data.message === 'string'
          ? err.response.data.message
          : 'Save failed.';
      toast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <nav className="admin-home-crumb">
        <Link to={base}>← {category.name} overview</Link>
      </nav>
      <div className="admin-screen-intro">
        <h1 className="admin-screen-title">Category info</h1>
        <p className="lede admin-screen-lede">
          Public listing page: <code>/{slug || '…'}</code>
        </p>
      </div>

      <form onSubmit={(e) => void onSubmit(e)}>
        <section className="admin-card admin-card-wide">
          <h2>Details</h2>
          <div className="admin-home-section-fields">
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              URL slug
              <input
                value={slug}
                onChange={(e) => setSlug(normalizeSlugInput(e.target.value))}
                spellCheck={false}
                required
                placeholder="category-slug"
              />
            </label>
            <label>
              Sort order
              <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
            </label>
            <label>
              Cover image URL
              <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" spellCheck={false} />
            </label>
            <label>
              Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </label>
          </div>
        </section>

        <section className="admin-card admin-card-wide" id="seo" style={{ marginTop: '1.25rem' }}>
          <h2>SEO</h2>
          <p className="lede admin-hint">
            Meta tags for <code>/{slug || '…'}</code>. Leave blank to use site-wide defaults or the category
            name and description above.
          </p>
          <AdminSeoFieldsEditor
            value={seo}
            onChange={setSeo}
            placeholders={{
              metaTitle: name,
              metaDescription: description,
              ogImage: image,
              canonicalPath: `/${slug || category.slug}`,
            }}
          />
          <button className="admin-save" type="submit" disabled={saving} style={{ marginTop: '1rem' }}>
            {saving ? 'Saving…' : 'Save category'}
          </button>
        </section>
      </form>
    </>
  );
}
