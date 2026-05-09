import { Link } from 'react-router-dom';
import { categoryAdminBase } from '@/lib/adminCategoryNav';
import { useAdminCategoryOutlet } from '@/pages/AdminCategoryLayout';

export function AdminCategoryHubPage() {
  const { category } = useAdminCategoryOutlet();
  const base = categoryAdminBase(category.slug);

  return (
    <>
      <nav className="admin-home-crumb">
        <Link to="/admin/pages/categories">← All categories</Link>
      </nav>
      <div className="admin-screen-intro">
        <h1 className="admin-screen-title">{category.name}</h1>
        <p className="lede admin-screen-lede">
          Edit this desk like the homepage: category details and the stories listed under{' '}
          <code>/category/{category.slug}</code>.{' '}
          <Link to={`/category/${category.slug}`} className="button-link" target="_blank" rel="noreferrer">
            View live category →
          </Link>
        </p>
      </div>

      <div className="admin-home-hub-grid">
        <Link className="admin-home-hub-card" to={`${base}/info`}>
          <h2>Category info</h2>
          <p className="admin-home-hub-meta">Name, description, cover image, sort order</p>
          <span className="admin-home-hub-cta">Edit →</span>
        </Link>

        <Link className="admin-home-hub-card" to={`${base}/stories`}>
          <h2>Stories</h2>
          <p className="admin-home-hub-meta">Card fields for articles in this category</p>
          <span className="admin-home-hub-cta">Edit stories →</span>
        </Link>
      </div>
    </>
  );
}
