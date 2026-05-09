import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentApi } from '@/lib/api';
import {
  headerBarOnly,
  heroCardHasContent,
  normalizeHeroCardsFromHomepage,
  normalizeMarqueeLinesFromHeader,
  resolveMarqueeTickerLines,
} from '@/lib/homepageHero';
import { articleHref, thumb } from '@/lib/adminStoryUtils';
import { useAdminHomeOutlet } from '@/pages/AdminHomeLayout';
import type { Article, Settings } from '@/types/api';

type HeaderBarPatch = {
  topBarLeft?: string;
  topBarCenter?: string;
  marquee?: string;
  marqueeLines?: string[];
};

export function AdminHomeHeaderPage() {
  const { form, setForm, saving, message, error, persist, clearStatus } = useAdminHomeOutlet();
  const [liveHeroStories, setLiveHeroStories] = useState<Article[]>([]);
  const [liveHeroLoading, setLiveHeroLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<Settings | null>(null);

  const headerBar = useMemo(() => headerBarOnly(form.homepage?.header), [form.homepage?.header]);

  const heroCardsResolved = useMemo(() => normalizeHeroCardsFromHomepage(form.homepage), [form.homepage]);
  const spotlightsDriveHero = useMemo(
    () => heroCardsResolved.some((c) => heroCardHasContent(c)),
    [heroCardsResolved]
  );
  const firstSpotlightCard = useMemo(
    () => heroCardsResolved.find((c) => heroCardHasContent(c)),
    [heroCardsResolved]
  );

  /** What the public ticker shows for the current form header (custom lines or automatic fallback). */
  const marqueeTickerPreview = useMemo(() => {
    return resolveMarqueeTickerLines({
      header: form.homepage?.header,
      siteName: siteSettings?.siteName,
      tagline: siteSettings?.tagline,
      notifications: siteSettings?.notifications,
      staticHeroLine:
        spotlightsDriveHero && firstSpotlightCard
          ? firstSpotlightCard.heroTitle?.trim() || firstSpotlightCard.heroTag?.trim()
          : undefined,
      leadStoryTitle: !spotlightsDriveHero ? liveHeroStories[0]?.title?.trim() : undefined,
    }).join(' · ');
  }, [
    form.homepage?.header,
    siteSettings,
    spotlightsDriveHero,
    firstSpotlightCard,
    liveHeroStories,
  ]);

  /** Non-empty lines actually saved (or legacy `marquee`); empty ⇒ site uses automatic ticker unless user is drafting rows. */
  const persistedMarqueeLines = useMemo(
    () => normalizeMarqueeLinesFromHeader(form.homepage?.header),
    [form.homepage?.header]
  );

  const marqueeRowCount = Math.max(1, headerBar.marqueeLines.length);

  /** Mirror legacy single-field UX: when nothing is persisted, line 1 shows the live automatic ticker so it matches preview and is editable. */
  const getMarqueeLineValue = useCallback(
    (index: number) => {
      const raw = headerBar.marqueeLines;
      const noPersistedCustom = persistedMarqueeLines.length === 0;
      const firstEmptyOrMissing =
        raw.length === 0 || !String(raw[0] ?? '').trim();
      if (noPersistedCustom && index === 0 && firstEmptyOrMissing) {
        return marqueeTickerPreview;
      }
      return raw[index] ?? '';
    },
    [headerBar.marqueeLines, persistedMarqueeLines.length, marqueeTickerPreview]
  );

  const updateHeaderBar = useCallback(
    (patch: HeaderBarPatch) => {
      clearStatus();
      setForm((prev) => ({
        ...prev,
        homepage: {
          ...prev.homepage,
          header: { ...headerBarOnly(prev.homepage?.header), ...patch },
        },
      }));
    },
    [setForm, clearStatus]
  );

  const updateMarqueeLine = useCallback(
    (index: number, value: string) => {
      const raw = headerBar.marqueeLines;
      const nothingPersistedYet = persistedMarqueeLines.length === 0;

      if (nothingPersistedYet && raw.length === 0 && index === 0) {
        updateHeaderBar({ marqueeLines: [value], marquee: '' });
        return;
      }

      const len = Math.max(raw.length, index + 1);
      const next = Array.from({ length: len }, (_, i) => {
        if (i === index) {
          return value;
        }
        return raw[i] ?? '';
      });
      updateHeaderBar({ marqueeLines: next, marquee: '' });
    },
    [headerBar.marqueeLines, persistedMarqueeLines.length, updateHeaderBar]
  );

  const addMarqueeLine = useCallback(() => {
    const raw = headerBar.marqueeLines;
    if (persistedMarqueeLines.length > 0 || raw.some((l) => String(l).trim())) {
      updateHeaderBar({ marqueeLines: [...raw, ''], marquee: '' });
      return;
    }
    updateHeaderBar({
      marqueeLines: [marqueeTickerPreview, ''],
      marquee: '',
    });
  }, [persistedMarqueeLines.length, headerBar.marqueeLines, marqueeTickerPreview, updateHeaderBar]);

  const removeMarqueeLine = useCallback(
    (index: number) => {
      const base = headerBar.marqueeLines;
      if (base.length <= 1) {
        updateHeaderBar({ marqueeLines: [], marquee: '' });
        return;
      }
      updateHeaderBar({
        marqueeLines: base.filter((_, i) => i !== index),
        marquee: '',
      });
    },
    [headerBar.marqueeLines, updateHeaderBar]
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLiveHeroLoading(true);
      try {
        const [featured, latest, fullSettings] = await Promise.all([
          contentApi.featured(),
          contentApi.latest(24),
          contentApi.settings(),
        ]);
        if (cancelled) {
          return;
        }
        setSiteSettings(fullSettings);
        const carousel = featured.length > 0 ? featured.slice(0, 5) : latest.slice(0, 5);
        setLiveHeroStories(carousel);
      } catch {
        if (!cancelled) {
          setLiveHeroStories([]);
        }
      } finally {
        if (!cancelled) {
          setLiveHeroLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await persist();
  };

  return (
    <>
      <nav className="admin-home-crumb">
        <Link to="/admin/pages/home">← Homepage overview</Link>
      </nav>
      <div className="admin-screen-intro">
        <h1 className="admin-screen-title">Header & hero</h1>
        <p className="lede admin-screen-lede">Top bar, ticker, and links to the stories that power the hero when needed.</p>
      </div>
      {message ? <div className="status-banner">{message}</div> : null}
      {error ? <div className="status-banner">{error}</div> : null}

      <form onSubmit={onSubmit}>
        <section className="admin-card admin-card-wide">
          <h2>Top bar (above logo)</h2>
          <div className="admin-home-section-fields">
            <label>
              Left text
              <input
                value={headerBar.topBarLeft || ''}
                placeholder="EST. 2026 • DUBAI, UAE"
                onChange={(e) => updateHeaderBar({ topBarLeft: e.target.value })}
              />
            </label>
            <label>
              Center text
              <input
                value={headerBar.topBarCenter || ''}
                placeholder="THE PULSE OF DUBAI (or uses site tagline if empty)"
                onChange={(e) => updateHeaderBar({ topBarCenter: e.target.value })}
              />
            </label>
          </div>
        </section>

        <section className="admin-card admin-card-wide">
          <h2>Hero marquee (under image)</h2>
          <p className="admin-hint admin-marquee-intro">
            Add one or more lines. They appear on the homepage in order, separated by middle dots. Leave all lines
            empty to use the automatic ticker (notifications and featured content).
          </p>
          <div className="admin-marquee-lines">
            {Array.from({ length: marqueeRowCount }, (_, index) => (
              <div key={`marquee-line-${index}`} className="admin-marquee-line-row">
                <label className="admin-marquee-line-label">
                  Marquee line {index + 1}
                  <textarea
                    rows={2}
                    value={getMarqueeLineValue(index)}
                    onChange={(e) => updateMarqueeLine(index, e.target.value)}
                    className="admin-marquee-textarea"
                    placeholder={
                      persistedMarqueeLines.length === 0 && index === 0
                        ? 'Shows the automatic ticker until you type custom text'
                        : 'Optional — leave blank to drop this segment when saving'
                    }
                  />
                </label>
                {marqueeRowCount > 1 ? (
                  <button
                    type="button"
                    className="admin-marquee-remove-line"
                    onClick={() => removeMarqueeLine(index)}
                  >
                    Remove line
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <button type="button" className="admin-marquee-add-line" onClick={addMarqueeLine}>
            + Add marquee line
          </button>
          <p className="admin-marquee-preview">
            <strong>Live preview:</strong> {marqueeTickerPreview}
          </p>
        </section>

        <section className="admin-card admin-card-wide admin-hero-live-section">
          <div className="admin-hero-spotlights-head">
            <h2>Live homepage hero (featured stories)</h2>
          </div>

          {liveHeroLoading ? (
            <p className="admin-hint">Loading featured stories…</p>
          ) : liveHeroStories.length === 0 ? (
            <p className="admin-hint">No featured or latest stories found. Mark articles as featured or publish stories.</p>
          ) : (
            <div className="admin-hero-live-grid">
              {liveHeroStories.map((article, i) => {
                const img = thumb(article.featuredImage);
                const catSlug = article.category?.slug || 'news';
                const editHref = `/admin/pages/category/${encodeURIComponent(catSlug)}/stories`;
                return (
                  <article key={article._id} className="admin-tile-card admin-hero-live-card">
                    <span className="admin-tile-card-accent" aria-hidden />
                    <header className="admin-tile-card-header">
                      <span className="admin-tile-card-index">{String(i + 1).padStart(2, '0')}</span>
                      <span className="admin-tile-card-eyebrow">{(article.category?.name || 'Story').toUpperCase()}</span>
                    </header>
                    <div className="admin-hero-live-card-body">
                      <div className="admin-hero-live-thumb">
                        {img ? <img src={img} alt="" /> : <div className="admin-hero-live-thumb-empty">No image</div>}
                      </div>
                      <h3 className="admin-hero-live-title">{article.title}</h3>
                      <p className="admin-hero-live-excerpt">{article.excerpt}</p>
                      <div className="admin-hero-live-card-links">
                        <Link className="admin-hero-live-edit-link" to={editHref}>
                          Edit in category →
                        </Link>
                        <a
                          className="admin-hero-live-view-link"
                          href={articleHref(article)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View on site ↗
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <button className="admin-save" type="submit" disabled={saving} style={{ marginTop: '0.5rem' }}>
          {saving ? 'Saving…' : 'Save header'}
        </button>
      </form>
    </>
  );
}
