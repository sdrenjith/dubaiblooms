'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [query, setQuery] = useState('');
  const [articleSuggestions, setArticleSuggestions] = useState<Article[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const categoriesForNav = useMemo(() => categories.filter(categoryVisibleInMainMenu), [categories]);
  const navItems = useMemo(() => categoriesForNav.slice(0, 6), [categoriesForNav]);
  const siteName = settings?.siteName || 'Dubai Blooms';
  const logoSrc = resolveMediaSrc(settings?.logo);
  const headerBar = settings?.homepage?.header;
  const utilityLeft = headerBar?.topBarLeft?.trim() || 'EST. 2026 • DUBAI, UAE';
  const utilityCenter =
    headerBar?.topBarCenter?.trim() ||
    (settings?.tagline ? settings.tagline.trim().toUpperCase() : '') ||
    'THE PULSE OF DUBAI';
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

  const navClass = (href: string, slug?: string) => {
    const active = slug ? isMainNavCategoryActive(pathname, slug) : pathname === href;
    return `${styles.navItem} ${active ? styles.active : ''}`;
  };

  return (
    <header className={styles.headerWrap}>
      <div className={styles.utilityBar}>
        <span className={styles.utilityText}>{utilityLeft}</span>
        <span className={styles.utilityCenter}>{utilityCenter}</span>
        <div className={styles.utilityRight}>
          <a href={settings?.socialLinks?.instagram || 'https://www.instagram.com/dubai.blooms?igsh=MXM0bGR4ZGhhZjByNg=='} target="_blank" rel="noreferrer" aria-label="Instagram">
            IG
          </a>
          <a href={settings?.socialLinks?.facebook || '#'} aria-label="Facebook">F</a>
          <a href={settings?.socialLinks?.twitter || '#'} aria-label="X">X</a>
          <a href={settings?.socialLinks?.linkedin || '#'} aria-label="LinkedIn">IN</a>
          <Link className={styles.utilityAdmin} href="/admin/login" aria-label="Admin login">
            ADMIN
          </Link>
        </div>
      </div>

      <div className={styles.mainBar}>
        <button className={styles.mobileToggle} type="button" onClick={() => setIsOpen((prev) => !prev)}>
          Menu
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

        <nav className={`${styles.nav} ${isOpen ? styles.navOpen : ''}`}>
          <Link className={navClass('/')} href="/" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          {navItems.map((category) => (
            <Link
              key={category._id}
              className={navClass(`/${category.slug}`, category.slug)}
              onClick={() => setIsOpen(false)}
              href={`/${category.slug}`}
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className={styles.mainActions}>
          <div className={styles.searchWrap}>
            <button className={styles.searchBtn} type="button" aria-label="Search stories" onClick={() => setSearchOpen((prev) => !prev)}>
              ⌕
            </button>
            {searchOpen ? (
              <div className={styles.searchPanel}>
                <div className={styles.searchPanelTop}>
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
                        onClick={() => {
                          router.push(`/${article.category?.slug || 'story'}/${article.slug}`);
                          closeSearch();
                        }}
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
                      onClick={() => {
                        router.push(`/${category.slug}`);
                        closeSearch();
                      }}
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
                      onClick={() => {
                        router.push(`/${tile.slug}`);
                        closeSearch();
                      }}
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
              </div>
            ) : null}
          </div>
          <button className={styles.subscribeBtn} type="button" onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })}>
            Subscribe
          </button>
        </div>
      </div>
    </header>
  );
}
