import { Link } from 'react-router-dom';
import { useAdminHomeOutlet } from '@/pages/AdminHomeLayout';

const HOME_BASE = '/admin/pages/home';

export function AdminHomeHubPage() {
  const { form, message, error } = useAdminHomeOutlet();
  const tiles = form.homepage?.categoryTiles || [];
  const sections = form.homepage?.sections || [];
  const reviews = form.homepage?.googleReviews || [];

  return (
    <>
      <div className="admin-screen-intro">
        <h1 className="admin-screen-title">Homepage</h1>
        <p className="lede admin-screen-lede">
          Open a block below to edit items as cards. Topic tiles and testimonials live in settings; story sections pull live
          articles from the API.{' '}
          <Link to="/" className="button-link" target="_blank" rel="noreferrer">
            View live home →
          </Link>
        </p>
      </div>
      {message ? <div className="status-banner">{message}</div> : null}
      {error ? <div className="status-banner">{error}</div> : null}

      <div className="admin-home-hub-grid">
        <Link className="admin-home-hub-card" to={`${HOME_BASE}/header`}>
          <h2>Header & hero</h2>
          <p className="admin-home-hub-meta">Top bar, marquee, static hero image & copy</p>
          <span className="admin-home-hub-cta">Edit →</span>
        </Link>

        <Link className="admin-home-hub-card" to={`${HOME_BASE}/tiles`}>
          <h2>Topic tiles</h2>
          <p className="admin-home-hub-meta">{tiles.length} tiles · explore row on the homepage</p>
          <span className="admin-home-hub-cta">Edit cards →</span>
        </Link>

        {sections.map((section, index) => (
          <Link key={`${section.id}-${index}`} className="admin-home-hub-card" to={`${HOME_BASE}/sections/${index}`}>
            <h2>{section.title?.trim() || section.id || `Section ${index + 1}`}</h2>
            <p className="admin-home-hub-meta">
              {section.source}
              {section.source === 'category' && section.categorySlug ? ` · /${section.categorySlug}` : ''} · limit{' '}
              {section.limit}
            </p>
            <span className="admin-home-hub-cta">Section & stories →</span>
          </Link>
        ))}

        <Link className="admin-home-hub-card" to={`${HOME_BASE}/reviews`}>
          <h2>Testimonial library</h2>
          <p className="admin-home-hub-meta">{reviews.length} testimonials</p>
          <span className="admin-home-hub-cta">Edit cards →</span>
        </Link>

        <Link className="admin-home-hub-card admin-home-hub-card-muted" to={`${HOME_BASE}/layout-sections`}>
          <h2>Sections & order</h2>
          <p className="admin-home-hub-meta">Add, remove, or reorder homepage blocks</p>
          <span className="admin-home-hub-cta">Manage →</span>
        </Link>
      </div>
    </>
  );
}
