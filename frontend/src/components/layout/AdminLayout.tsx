import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { contentApi } from '@/lib/api';
import { ADMIN_CATEGORIES_UPDATED, ADMIN_SITE_SETTINGS_UPDATED } from '@/lib/adminEvents';
import { resolveMediaSrc } from '@/lib/mediaUrl';
import { categorySidebarNav } from '@/lib/adminCategoryNav';
import { homeSidebarNavChunks } from '@/lib/adminSectionNav';
import { AdminToastProvider } from '@/context/AdminToastContext';
import type { Category, Settings } from '@/types/api';
import styles from './AdminLayout.module.css';

const HOME_PATH = '/admin/pages/home';
const CATEGORIES_PATH = '/admin/pages/categories';

function formatApiFailure(reason: unknown, label: string): string {
  if (axios.isAxiosError(reason)) {
    if (reason.code === 'ERR_NETWORK' || reason.message === 'Network Error') {
      return `${label}: network error (is the API running?)`;
    }
    const data = reason.response?.data;
    if (data && typeof data === 'object' && 'message' in data) {
      const msg = String((data as { message?: string }).message || '').trim();
      if (msg) {
        return `${label}: ${msg}`;
      }
    }
    return `${label}: ${reason.message}`;
  }
  if (reason instanceof Error) {
    return `${label}: ${reason.message}`;
  }
  return `${label}: failed`;
}

export function AdminLayout() {
  const token = localStorage.getItem('adminToken');
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteSettings, setSiteSettings] = useState<Settings | null>(null);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [homeSubOpen, setHomeSubOpen] = useState(false);
  const [categorySubOpen, setCategorySubOpen] = useState<Record<string, boolean>>({});
  const [pagesFetchError, setPagesFetchError] = useState<string | null>(null);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  /** Initial load + categories refresh if list changes elsewhere (grid save). */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setPagesLoading(true);
      setPagesFetchError(null);
      try {
        const [catResult, settingsResult] = await Promise.allSettled([
          contentApi.categories(),
          contentApi.settings(),
        ]);
        if (cancelled) {
          return;
        }
        const errs: string[] = [];
        if (catResult.status === 'fulfilled') {
          setCategories(catResult.value);
        } else {
          errs.push(formatApiFailure(catResult.reason, 'Categories'));
        }
        if (settingsResult.status === 'fulfilled') {
          setSiteSettings((prev) => settingsResult.value ?? prev);
        } else {
          errs.push(formatApiFailure(settingsResult.reason, 'Settings'));
        }
        if (errs.length) {
          setPagesFetchError(errs.join(' · '));
        }
      } finally {
        if (!cancelled) {
          setPagesLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onCategoriesUpdated = () => {
      void contentApi
        .categories()
        .then((cats) => setCategories(cats))
        .catch(() => {
          /* keep prior list */
        });
    };
    window.addEventListener(ADMIN_CATEGORIES_UPDATED, onCategoriesUpdated);
    return () => window.removeEventListener(ADMIN_CATEGORIES_UPDATED, onCategoriesUpdated);
  }, []);

  useEffect(() => {
    const onSiteSettingsUpdated = () => {
      void contentApi
        .settings()
        .then((s) => {
          if (s) {
            setSiteSettings(s);
          }
        })
        .catch(() => {
          /* keep cached */
        });
    };
    window.addEventListener(ADMIN_SITE_SETTINGS_UPDATED, onSiteSettingsUpdated);
    return () => window.removeEventListener(ADMIN_SITE_SETTINGS_UPDATED, onSiteSettingsUpdated);
  }, []);

  /** Keep homepage subsection list in sync after edits (sections & order, section saves). */
  useEffect(() => {
    if (!location.pathname.startsWith(HOME_PATH)) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const settings = await contentApi.settings();
        if (!cancelled && settings) {
          setSiteSettings(settings);
        }
      } catch {
        /* keep cached sidebar */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.startsWith(HOME_PATH)) {
      setHomeSubOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    const m = location.pathname.match(/^\/admin\/pages\/category\/([^/]+)/);
    if (m) {
      const s = decodeURIComponent(m[1]);
      setCategorySubOpen((prev) => ({ ...prev, [s]: true }));
    }
  }, [location.pathname]);

  /** When settings arrive after first paint, open Home submenu if user is editing the homepage. */
  useEffect(() => {
    if (siteSettings && location.pathname.startsWith(HOME_PATH)) {
      setHomeSubOpen(true);
    }
  }, [siteSettings, location.pathname]);

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const logout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const oa = typeof a.order === 'number' ? a.order : 0;
      const ob = typeof b.order === 'number' ? b.order : 0;
      if (oa !== ob) {
        return oa - ob;
      }
      return a.name.localeCompare(b.name);
    });
  }, [categories]);

  const mobileTitle = useMemo(() => {
    const path = location.pathname;
    const catMatch = path.match(/^\/admin\/pages\/category\/([^/]+)(?:\/(info|stories))?$/);
    if (catMatch) {
      const slug = decodeURIComponent(catMatch[1]);
      const sub = catMatch[2];
      const cat = categories.find((c) => c.slug === slug);
      const name = cat?.name || slug;
      if (sub === 'info') {
        return `${name} · category info`;
      }
      if (sub === 'stories') {
        return `${name} · stories`;
      }
      return name;
    }
    if (path.startsWith(HOME_PATH)) {
      if (path === HOME_PATH) {
        return 'Home page';
      }
      if (path.includes('/header')) {
        return 'Header & hero';
      }
      if (path.includes('/tiles')) {
        return 'Topic tiles';
      }
      if (path.includes('/reviews')) {
        return 'Testimonial library';
      }
      if (path.includes('/layout-sections')) {
        return 'Sections & order';
      }
      if (path.includes('/sections/')) {
        const sm = path.match(/\/sections\/(\d+)/);
        const idx = sm ? Number(sm[1]) : -1;
        const sec = idx >= 0 ? siteSettings?.homepage?.sections?.[idx] : undefined;
        return sec?.title?.trim() || sec?.id?.trim() || `Home section ${idx >= 0 ? idx + 1 : ''}`.trim();
      }
      return 'Home page';
    }
    if (path.startsWith(CATEGORIES_PATH)) {
      return 'Categories';
    }
    if (path.startsWith('/admin/settings')) {
      return 'Site settings';
    }
    if (path.startsWith('/admin/newsletter')) {
      return 'Newsletter';
    }
    return 'Dashboard';
  }, [location.pathname, categories, siteSettings]);

  const homeSubLinks = useMemo(() => homeSidebarNavChunks(siteSettings), [siteSettings]);

  return (
    <AdminToastProvider>
      <div className={styles.shell}>
      {sidebarOpen ? (
        <button type="button" className={styles.backdrop} aria-label="Close menu" onClick={() => setSidebarOpen(false)} />
      ) : null}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`} aria-label="Admin menu">
        <div className={styles.sidebarBrand}>
          {siteSettings?.logo?.trim() ? (
            <img
              className={styles.sidebarLogoImg}
              src={resolveMediaSrc(siteSettings.logo)}
              alt={siteSettings.siteName?.trim() || 'Site'}
              width={200}
              height={40}
            />
          ) : (
            <p className={styles.sidebarLogo}>{siteSettings?.siteName?.trim() || 'Dubai Blooms'}</p>
          )}
          <p className={styles.sidebarTag}>Administration</p>
        </div>
        <nav id="admin-sidebar-nav" className={styles.nav}>
          <div className={styles.navBlock}>
            <p className={styles.navSectionLabel}>Dashboard</p>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              end
            >
              <span className={styles.navIcon} aria-hidden>
                ◎
              </span>
              Site settings
            </NavLink>
            <NavLink
              to="/admin/newsletter"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              end
            >
              <span className={styles.navIcon} aria-hidden>
                ✉
              </span>
              Newsletter subscribers
            </NavLink>
          </div>

          <div className={styles.navBlock}>
            <p className={styles.navSectionLabel}>Site pages</p>
            <NavLink
              to={CATEGORIES_PATH}
              className={({ isActive }) => `${styles.pageLink} ${isActive ? styles.navLinkActive : ''}`}
              end
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.navIcon} aria-hidden>
                ▦
              </span>
              <span className={styles.pageLinkLabel}>Categories</span>
            </NavLink>
            <div className={styles.pageNavRow}>
              <NavLink
                to={HOME_PATH}
                className={({ isActive }) => `${styles.pageLink} ${isActive ? styles.navLinkActive : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className={styles.navIcon} aria-hidden>
                  ⌂
                </span>
                <span className={styles.pageLinkLabel}>Homepage</span>
              </NavLink>
              <button
                type="button"
                className={styles.pageNavToggle}
                aria-expanded={homeSubOpen}
                aria-controls="admin-home-subnav"
                aria-label={homeSubOpen ? 'Collapse home sections' : 'Expand home sections'}
                onClick={(e) => {
                  e.preventDefault();
                  setHomeSubOpen((v) => !v);
                }}
              >
                {homeSubOpen ? '▾' : '▸'}
              </button>
            </div>
            {homeSubOpen ? (
              <div id="admin-home-subnav" className={styles.subNav} role="group" aria-label="Home page sections">
                {homeSubLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `${styles.subNavLink} ${isActive ? styles.subNavLinkActive : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ) : null}

            {pagesLoading ? (
              <p className={styles.pagesHint}>Loading…</p>
            ) : null}
            {pagesFetchError ? <p className={styles.pagesHintErr}>{pagesFetchError}</p> : null}
            {!pagesLoading && !pagesFetchError && categories.length === 0 ? (
              <p className={styles.pagesHint}>No categories yet. Run seed or add in the database.</p>
            ) : null}

            {sortedCategories.map((cat) => {
              const base = `/admin/pages/category/${encodeURIComponent(cat.slug)}`;
              const subOpen = categorySubOpen[cat.slug] ?? false;
              const subId = `admin-cat-subnav-${cat.slug}`;
              return (
                <div key={cat._id}>
                  <div className={styles.pageNavRow}>
                    <NavLink
                      to={base}
                      className={({ isActive }) => `${styles.pageLink} ${isActive ? styles.navLinkActive : ''}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className={styles.navIcon} aria-hidden>
                        ◫
                      </span>
                      <span className={styles.pageLinkLabel}>{cat.name}</span>
                    </NavLink>
                    <button
                      type="button"
                      className={styles.pageNavToggle}
                      aria-expanded={subOpen}
                      aria-controls={subId}
                      aria-label={subOpen ? `Collapse ${cat.name} sections` : `Expand ${cat.name} sections`}
                      onClick={(e) => {
                        e.preventDefault();
                        setCategorySubOpen((v) => ({ ...v, [cat.slug]: !v[cat.slug] }));
                      }}
                    >
                      {subOpen ? '▾' : '▸'}
                    </button>
                  </div>
                  {subOpen ? (
                    <div id={subId} className={styles.subNav} role="group" aria-label={`${cat.name} admin`}>
                      {categorySidebarNav(cat.slug).map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) =>
                            `${styles.subNavLink} ${isActive ? styles.subNavLinkActive : ''}`
                          }
                          onClick={() => setSidebarOpen(false)}
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </nav>
        <div className={styles.sidebarFooter}>
          <Link className={styles.visitSite} to="/" target="_blank" rel="noreferrer">
            <span aria-hidden>↗</span> Visit site
          </Link>
          <button className={styles.logoutBtn} type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      <div className={styles.mainColumn}>
        <header className={styles.mobileBar}>
          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar-nav"
            onClick={() => setSidebarOpen((o) => !o)}
          >
            ☰
          </button>
          <h1 className={styles.mobileTitle}>{mobileTitle}</h1>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
    </AdminToastProvider>
  );
}
