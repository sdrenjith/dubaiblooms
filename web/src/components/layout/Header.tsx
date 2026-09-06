'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { contentApi } from '@/lib/api';
import type { Article, Category, Settings } from '@/types/api';
import { categoryVisibleInMainMenu, isMainNavCategoryActive } from '@/lib/categoryNav';
import { resolveMediaSrc } from '@/lib/mediaUrl';
import styles from './Header.module.css';

type Props = {
  settings: Settings | null;
  categories: Category[];
};

export function Header({ settings, categories }: Props) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const drawerOpen = isOpen || searchOpen;
  const headerRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState('');
  const [articleSuggestions, setArticleSuggestions] = useState<Article[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const categoriesForNav = useMemo(() => categories.filter(categoryVisibleInMainMenu), [categories]);
  const navItems = useMemo(() => categoriesForNav.slice(0, 6), [categoriesForNav]);
  const siteName = settings?.siteName || 'Dubai Blooms';
  const logoSrc = resolveMediaSrc(settings?.logo);
  const queryText = query.trim().toLowerCase();
  const tileSuggestions = settings?.homepage?.categoryTiles || [];
  const sectionSuggestions = settings?.homepage?.sections || [];

  const filteredCategorySuggestions = useMemo(() => {
    if (!queryText) {
      return categoriesForNav.slice(0, 5);
    }
    return categoriesForNav.filter((category) => category.name.toLowerCase().includes(queryText)).slice(0, 5);
  }, [categoriesForNav, queryText]);

  const filteredTileSuggestions = useMemo(() => {
    if (!queryText) {
      return tileSuggestions.slice(0, 5);
    }
    return tileSuggestions.filter((tile) => tile.title.toLowerCase().includes(queryText)).slice(0, 5);
  }, [queryText, tileSuggestions]);

  const filteredSectionSuggestions = useMemo(() => {
    if (!queryText) {
      return sectionSuggestions.slice(0, 5);
    }
    return sectionSuggestions.filter((section) => section.title.toLowerCase().includes(queryText)).slice(0, 5);
  }, [queryText, sectionSuggestions]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && headerRef.current && !headerRef.current.contains(target)) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }
    if (query.trim().length < 2) {
      setArticleSuggestions([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await contentApi.searchArticles(query.trim());
        setArticleSuggestions(results.slice(0, 7));
      } catch {
        setArticleSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 260);

    return () => window.clearTimeout(timer);
  }, [query, searchOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    setArticleSuggestions([]);
    setSearchLoading(false);
  };

  const closeMenu = () => {
    setIsOpen(false);
    closeSearch();
  };

  const openMenu = () => {
    closeSearch();
    setIsOpen(true);
  };

  const toggleSearch = () => {
    if (searchOpen) {
      closeSearch();
      return;
    }
    setSearchOpen(true);
  };

  const goToSearchResult = (href: string) => {
    router.push(href);
    closeMenu();
  };

  const navClass = (href: string, slug?: string) => {
    const active = slug ? isMainNavCategoryActive(pathname, slug) : pathname === href;
    return `${styles.navItem} ${active ? styles.active : ''}`;
  };

  const renderSearchFields = () => (
    <>
      <div className={styles.searchPanelTop}>
        <div className={styles.searchField}>
          <input
            className={styles.searchInput}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories, categories..."
            autoFocus
          />
          <button className={styles.searchClose} type="button" onClick={closeSearch} aria-label="Close search">
            ×
          </button>
        </div>
      </div>

      {searchLoading ? <p className={styles.searchHint}>Searching...</p> : null}

      <div className={styles.searchGroup}>
        <p className={styles.searchGroupTitle}>Articles</p>
        {articleSuggestions.length === 0 ? (
          <p className={styles.searchHint}>Type at least 2 characters to search articles.</p>
        ) : (
          articleSuggestions.map((article) => (
            <button
              key={article._id}
              type="button"
              className={styles.searchItem}
              onClick={() => goToSearchResult(`/${article.category?.slug || 'story'}/${article.slug}`)}
            >
              {article.title}
            </button>
          ))
        )}
      </div>

      <div className={styles.searchGroup}>
        <p className={styles.searchGroupTitle}>Categories</p>
        {filteredCategorySuggestions.map((category) => (
          <button
            key={category._id}
            type="button"
            className={styles.searchItem}
            onClick={() => goToSearchResult(`/${category.slug}`)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className={styles.searchGroup}>
        <p className={styles.searchGroupTitle}>Homepage Tiles (Admin Config)</p>
        {filteredTileSuggestions.map((tile) => (
          <button
            key={`${tile.slug}-${tile.title}`}
            type="button"
            className={styles.searchItem}
            onClick={() => goToSearchResult(`/${tile.slug}`)}
          >
            {tile.title}
          </button>
        ))}
      </div>

      <div className={styles.searchGroup}>
        <p className={styles.searchGroupTitle}>Homepage Sections (Admin Config)</p>
        {filteredSectionSuggestions.map((section) => (
          <span key={section.id} className={styles.searchChip}>
            {section.title}
          </span>
        ))}
      </div>
    </>
  );

  return (
    <header className={styles.headerWrap} ref={headerRef}>
      <div className={styles.mainBar}>
        <button
          className={`${styles.mobileToggle} ${drawerOpen ? styles.mobileToggleClose : ''}`}
          type="button"
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={drawerOpen}
          onClick={() => (drawerOpen ? closeMenu() : openMenu())}
        >
          {drawerOpen ? (
            <span className={styles.mobileCloseIcon} aria-hidden="true">
              ×
            </span>
          ) : (
            <span className={styles.mobileHamburgerIcon} aria-hidden="true">
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1h16M1 7h16M1 13h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          )}
        </button>

        <Link className={styles.brand} href="/">
          {logoSrc ? (
            <img className={styles.brandLogoImg} src={logoSrc} alt={siteName} width={280} height={46} />
          ) : (
            <>
              <span className={styles.brandMonogram}>B</span>
              <span className={styles.logo}>
                <span className={styles.logoPrimary}>{siteName.split(' ')[0] || siteName}</span>{' '}
                <span className={styles.logoAccent}>{siteName.split(' ').slice(1).join(' ')}</span>
              </span>
            </>
          )}
        </Link>

        <nav className={`${styles.nav} ${drawerOpen ? styles.navOpen : ''} ${searchOpen ? styles.navSearchOpen : ''}`}>
          {searchOpen ? <div className={styles.navSearchPanel}>{renderSearchFields()}</div> : null}
          <Link className={navClass('/')} href="/" onClick={closeMenu}>
            Home
          </Link>
          {navItems.map((category) => (
            <Link
              key={category._id}
              className={navClass(`/${category.slug}`, category.slug)}
              onClick={closeMenu}
              href={`/${category.slug}`}
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className={styles.mainActions}>
          <div className={styles.searchWrap}>
            <button
              className={styles.searchBtn}
              type="button"
              aria-label="Search stories"
              aria-expanded={searchOpen}
              onClick={toggleSearch}
            >
              ⌕
            </button>
            {searchOpen && !isOpen ? <div className={styles.searchPanel}>{renderSearchFields()}</div> : null}
          </div>
          <Link className={styles.adminLink} href="/admin/login" aria-label="Admin">
            <svg className={styles.adminIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                fill="currentColor"
              />
            </svg>
          </Link>
          <button className={styles.subscribeBtn} type="button" onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })}>
            Subscribe
          </button>
        </div>
      </div>
    </header>
  );
}
