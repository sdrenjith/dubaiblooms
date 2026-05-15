import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/lib/api';
import { useAdminToast } from '@/context/AdminToastContext';
import { categoryAdminBase } from '@/lib/adminCategoryNav';
import { useAdminCategoryOutlet } from '@/pages/AdminCategoryLayout';

export function AdminCategoryInfoPage() {
  const { category, token, refreshCategory } = useAdminCategoryOutlet();
  const toast = useAdminToast();
  const base = categoryAdminBase(category.slug);
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description || '');
  const [image, setImage] = useState(category.image || '');
  const [order, setOrder] = useState(typeof category.order === 'number' ? category.order : 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(category.name);
    setDescription(category.description || '');
    setImage(category.image || '');
    setOrder(typeof category.order === 'number' ? category.order : 0);
  }, [category]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateCategory(
        category._id,
        {
          name: name.trim(),
          description,
          image: image.trim(),
          order,
        },
        token
      );
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
          Public listing page: <code>/category/{category.slug}</code>
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
          <button className="admin-save" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save category'}
          </button>
        </section>
      </form>
    </>
  );
}
