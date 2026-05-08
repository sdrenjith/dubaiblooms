import { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSiteData } from '@/hooks/useSiteData';
import styles from './Header.module.css';

export function Header() {
  const { settings, categories } = useSiteData();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = useMemo(() => categories.slice(0, 6), [categories]);

  return (
    <header className={styles.headerWrap}>
      <div className={styles.topBar}>
        <p className={styles.tagline}>{settings?.tagline || 'Curated stories from Dubai and beyond'}</p>
        <button className={styles.subscribeBtn} type="button">
          Subscribe
        </button>
      </div>

      <div className={styles.mainBar}>
        <button className={styles.mobileToggle} type="button" onClick={() => setIsOpen((prev) => !prev)}>
          Menu
        </button>

        <Link className={styles.logo} to="/">
          {settings?.siteName || 'Dubai Blooms'}
        </Link>

        <button className={styles.searchBtn} type="button" aria-label="Open search">
          Search
        </button>
      </div>

      <nav className={`${styles.nav} ${isOpen ? styles.navOpen : ''}`}>
        <NavLink className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`} to="/">
          Home
        </NavLink>
        {navItems.map((category) => (
          <NavLink
            key={category._id}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => setIsOpen(false)}
            to={`/category/${category.slug}`}
          >
            {category.name}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
