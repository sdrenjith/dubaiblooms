import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { contentApi } from '@/lib/api';
import {
  heroCardHasContent,
  normalizeHeroCardsFromHomepage,
  resolveMarqueeTickerLines,
} from '@/lib/homepageHero';
import { resolvePageMeta } from '@/lib/seoMeta';
import type { Article, Settings } from '@/types/api';

type HomepageTile = {
  title: string;
  subtitle: string;
  slug: string;
};

const fallbackTiles: HomepageTile[] = [
  { title: 'Latest updates', subtitle: 'Newsroom highlights', slug: 'news' },
  { title: 'Top experiences', subtitle: 'Things to do now', slug: 'things-to-do' },
  { title: 'Culinary delights', subtitle: 'Food and drink picks', slug: 'food-drink' },
  { title: 'Live well', subtitle: 'Lifestyle and wellness', slug: 'lifestyle' },
  { title: 'Art and heritage', subtitle: 'Culture essentials', slug: 'culture' },
  { title: 'Wander more', subtitle: 'Travel inspiration', slug: 'travel' },
];

function getImageUrl(image?: string): string {
  if (!image) {
    return '';
  }
  if (image.startsWith('http')) {
    return image;
  }
  return image.startsWith('/') ? image : `/${image}`;
}

/** Prefer featured image, then SEO OG image, then category cover — keeps the hero visual when one field is empty. */
function resolveHeroImageForArticle(article?: Article | null): string {
  if (!article) {
    return '';
  }
  const featured = article.featuredImage?.trim();
  if (featured) {
    return getImageUrl(featured);
  }
  const og = article.seo?.ogImage?.trim();
  if (og) {
    return getImageUrl(og);
  }
  const catImg = article.category?.image?.trim();
  if (catImg) {
    return getImageUrl(catImg);
  }
  return '';
}

function formatDate(date?: string): string {
  if (!date) {
    return 'Fresh update';
  }
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseHeroLink(link?: string): { external: boolean; href: string } {
  const raw = (link || '').trim();
  if (!raw) {
    return { external: false, href: '/' };
  }
  if (/^https?:\/\//i.test(raw)) {
    return { external: true, href: raw };
  }
  return { external: false, href: raw.startsWith('/') ? raw : `/${raw}` };
}

export function HomePage() {
  const [featured, setFeatured] = useState<Article[]>([]);
  const [latest, setLatest] = useState<Article[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [categoryStories, setCategoryStories] = useState<Record<string, Article[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const heroCardsResolved = useMemo(
    () => normalizeHeroCardsFromHomepage(settings?.homepage),
    [settings?.homepage]
  );
  const staticSlides = useMemo(
    () => heroCardsResolved.filter((c) => heroCardHasContent(c)),
    [heroCardsResolved]
  );
  const useStaticHero = staticSlides.length > 0;
  const carouselStories = featured.length > 0 ? featured.slice(0, 5) : latest.slice(0, 5);
  const sliderStories = useStaticHero ? [] : carouselStories;
  const leadStory = useStaticHero ? undefined : sliderStories[activeSlide] || featured[0] || latest[0];
  const staticSlide = useStaticHero ? staticSlides[Math.min(activeSlide, staticSlides.length - 1)] : undefined;
  const categoryTiles: HomepageTile[] = settings?.homepage?.categoryTiles?.length
    ? settings.homepage.categoryTiles
    : fallbackTiles;
  const homepageSections =
    settings?.homepage?.sections?.length
      ? settings.homepage.sections
      : [
          {
            id: 'featured-grid',
            title: 'On the Move',
            subtitle: 'Daily city pulse, culture moments, and travel inspiration.',
            source: 'featured' as const,
            limit: 4,
          },
          {
            id: 'latest-stories',
            title: 'Latest Stories',
            subtitle: 'Updated continuously from the newsroom.',
            source: 'latest' as const,
            limit: 12,
          },
          {
            id: 'google-reviews',
            title: 'Google Reviews',
            subtitle: 'What readers and visitors are saying about Dubai Blooms.',
            source: 'reviews' as const,
            limit: 4,
          },
        ];
  const googleReviews = settings?.homepage?.googleReviews || [];
  const autoplayMs = Math.max(2500, settings?.homepage?.heroAutoplayMs || 5000);

  const pageMeta = useMemo(() => {
    if (!settings) {
      return null;
    }
    return resolvePageMeta(
      settings.pageSeo?.home || {},
      {
        title: settings.siteName,
        description: settings.tagline,
        image: settings.logo,
      },
      settings.seoDefaults,
      settings.siteName || 'Dubai Blooms',
      '/'
    );
  }, [settings]);

  usePageMeta(pageMeta);

  const heroMarqueeText = useMemo(() => {
    return resolveMarqueeTickerLines({
      header: settings?.homepage?.header,
      siteName: settings?.siteName,
      tagline: settings?.tagline,
      notifications: settings?.notifications,
      staticHeroLine:
        useStaticHero ? staticSlide?.heroTitle?.trim() || staticSlide?.heroTag?.trim() : undefined,
      leadStoryTitle: useStaticHero ? undefined : leadStory?.title?.trim(),
    }).join(' · ');
  }, [
    settings?.homepage?.header,
    settings?.notifications,
    settings?.siteName,
    settings?.tagline,
    leadStory?.title,
    useStaticHero,
    staticSlide?.heroTitle,
    staticSlide?.heroTag,
  ]);

  useEffect(() => {
    let isMounted = true;

    const loadHome = async () => {
      setLoading(true);
      setError(null);
      try {
        const [featuredItems, latestItems, siteSettings] = await Promise.all([
          contentApi.featured(),
          contentApi.latest(36),
          contentApi.settings(),
        ]);
        if (!isMounted) {
          return;
        }
        setFeatured(featuredItems);
        setLatest(latestItems);
        setSettings(siteSettings);
      } catch {
        if (!isMounted) {
          return;
        }
        setError('Unable to load homepage stories right now.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadHome();

    return () => {
      isMounted = false;
    };
  }, []);

  const rotatingHeroCount = useStaticHero ? staticSlides.length : sliderStories.length;

  useEffect(() => {
    if (rotatingHeroCount <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % rotatingHeroCount);
    }, autoplayMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [autoplayMs, rotatingHeroCount]);

  useEffect(() => {
    if (activeSlide > rotatingHeroCount - 1) {
      setActiveSlide(0);
    }
  }, [activeSlide, rotatingHeroCount]);

  const goToPrevious = () => {
    if (rotatingHeroCount === 0) {
      return;
    }
    setActiveSlide((prev) => (prev - 1 + rotatingHeroCount) % rotatingHeroCount);
  };

  const goToNext = () => {
    if (rotatingHeroCount === 0) {
      return;
    }
    setActiveSlide((prev) => (prev + 1) % rotatingHeroCount);
  };

  useEffect(() => {
    const categorySections = homepageSections.filter((section) => section.source === 'category' && section.categorySlug);
    if (categorySections.length === 0) {
      return;
    }

    const loadCategorySections = async () => {
      const slugSet = Array.from(new Set(categorySections.map((section) => section.categorySlug!).filter(Boolean)));
      const entries = await Promise.all(
        slugSet.map(async (slug) => {
          try {
            const { articles } = await contentApi.articlesByCategory(slug, 1, 24);
            return [slug, articles] as const;
          } catch {
            return [slug, []] as const;
          }
        })
      );
      setCategoryStories(Object.fromEntries(entries));
    };

    void loadCategorySections();
  }, [homepageSections]);

  const staticHeroImage = staticSlide?.heroImageUrl?.trim() ? getImageUrl(staticSlide.heroImageUrl) : '';
  const heroVisualSrc = useMemo(() => {
    const pool = featured.length > 0 ? featured.slice(0, 5) : latest.slice(0, 5);
    if (useStaticHero) {
      if (staticHeroImage) {
        return staticHeroImage;
      }
      const idx = Math.min(activeSlide, Math.max(0, pool.length - 1));
      return resolveHeroImageForArticle(pool[idx]);
    }
    return resolveHeroImageForArticle(leadStory);
  }, [
    useStaticHero,
    staticHeroImage,
    activeSlide,
    featured,
    latest,
    leadStory,
  ]);

  const staticTag = staticSlide?.heroTag?.trim() || 'Featured';
  const staticTitle = staticSlide?.heroTitle?.trim() || '';
  const staticExcerpt = staticSlide?.heroExcerpt?.trim() || '';
  const staticBtn = staticSlide?.heroButtonLabel?.trim() || 'Read full story';
  const staticLink = parseHeroLink(staticSlide?.heroLink);

  return (
    <>
      <section className="hero hero-story hero-fullwidth" aria-label={useStaticHero ? 'Home hero' : 'Featured stories'}>
        <div className="hero-media">
          <div className="hero-media-visual">
            {heroVisualSrc ? (
              <img
                src={heroVisualSrc}
                alt={useStaticHero ? staticTitle || 'Home hero' : leadStory?.title || 'Featured story'}
              />
            ) : (
              <div className="hero-placeholder">Dubai Blooms</div>
            )}
            {rotatingHeroCount > 1 ? (
              <div className="slider-controls">
                <button type="button" className="slider-button" onClick={goToPrevious} aria-label="Previous slide">
                  ‹
                </button>
                <button type="button" className="slider-button" onClick={goToNext} aria-label="Next slide">
                  ›
                </button>
              </div>
            ) : null}
          </div>
          <div className="hero-marquee">
            <div className="hero-marquee-inner">
              <span className="hero-marquee-segment">{heroMarqueeText}</span>
              <span className="hero-marquee-segment" aria-hidden="true">
                {heroMarqueeText}
              </span>
            </div>
          </div>
        </div>

        <div className="hero-copy">
          {useStaticHero ? (
            <>
              <p className="card-meta feature-spotlight-label">{staticTag}</p>
              <h1 key={`static-hero-${activeSlide}`} className="hero-title-animated">
                <span className="hero-title-duotone">{staticTitle || 'Dubai Blooms'}</span>
              </h1>
              <p className="lede hero-lede">
                {staticExcerpt ||
                  'Curated premium experiences, culture highlights, and modern lifestyle stories from Dubai and beyond.'}
              </p>
              {staticLink.external ? (
                <a
                  className="button-link feature-spotlight-btn"
                  href={staticLink.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {staticBtn}
                </a>
              ) : (
                <Link className="button-link feature-spotlight-btn" to={staticLink.href}>
                  {staticBtn}
                </Link>
              )}
              {staticSlides.length > 1 ? (
                <div className="slider-dots" aria-label="Hero spotlight navigation">
                  {staticSlides.map((_card, index) => (
                    <button
                      key={`static-dot-${index}`}
                      type="button"
                      className={`slider-dot ${index === activeSlide ? 'slider-dot-active' : ''}`}
                      onClick={() => setActiveSlide(index)}
                      aria-label={`Go to spotlight ${index + 1}`}
                    />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <p className="card-meta feature-spotlight-label">{leadStory?.category?.name || 'Featured'}</p>
              <h1 key={leadStory?._id || 'fallback'} className="hero-title-animated">
                <span className="hero-title-duotone">
                  {leadStory?.title || 'Weekend Escape: The Best Desert Glamping Experiences Near Dubai'}
                </span>
              </h1>
              <p className="lede hero-lede">
                {leadStory?.excerpt ||
                  'Curated premium experiences, culture highlights, and modern lifestyle stories from Dubai and beyond.'}
              </p>
              <Link
                className="button-link feature-spotlight-btn"
                to={leadStory ? `/${leadStory.category?.slug || 'story'}/${leadStory.slug}` : '/'}
              >
                Read full story
              </Link>
              <div className="slider-dots" aria-label="Story slider navigation">
                {sliderStories.map((story, index) => (
                  <button
                    key={story._id}
                    type="button"
                    className={`slider-dot ${index === activeSlide ? 'slider-dot-active' : ''}`}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <div className="page-wrap">
        {error ? (
          <section className="section">
            <div className="status-banner">{error}</div>
          </section>
        ) : null}

        <section className="category-strip-wrap" aria-labelledby="category-topics-heading">
          <header className="category-strip-header">
            <h2 id="category-topics-heading" className="category-strip-heading">
              Explore topics
            </h2>
            <p className="category-strip-lede">
              News, dining, culture, and travel—choose a lane to start reading.
            </p>
          </header>
          <div className="category-strip">
            {categoryTiles.map((tile, index) => (
              <Link key={tile.slug} className="category-pill" to={`/category/${tile.slug}`}>
                <span className="category-pill-accent" aria-hidden />
                <span className="category-index">{`0${index + 1}`.slice(-2)}</span>
                <h3>{tile.title}</h3>
                <p className="category-subtitle">{tile.subtitle}</p>
                <span className="category-pill-arrow" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

      {homepageSections.map((section) => {
        if (section.source === 'reviews') {
          const reviewItems = googleReviews.slice(0, Math.max(1, section.limit || 6));
          return (
            <section key={section.id} className="section">
              <div className="section-head">
                <h2>{section.title}</h2>
              </div>
              <div className="reviews-grid">
                {reviewItems.length === 0 ? (
                  <article className="review-card">
                    <p className="card-meta">Google Reviews</p>
                    <h3>No reviews configured yet.</h3>
                    <p>Add review items from admin settings to display them here.</p>
                  </article>
                ) : null}
                {reviewItems.map((review, idx) => (
                  <article key={`${review.author}-${idx}`} className="review-card">
                    <p className="card-meta">Google Review</p>
                    <div className="review-stars" aria-label={`${review.rating} star rating`}>
                      {'★'.repeat(Math.max(1, Math.min(5, review.rating)))}
                      {'☆'.repeat(5 - Math.max(1, Math.min(5, review.rating)))}
                    </div>
                    <h3>{review.author}</h3>
                    <p>{review.review}</p>
                    <p className="review-meta">
                      {review.location} - {review.postedAt}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          );
        }

        const sourceStories =
          section.source === 'featured'
            ? featured
            : section.source === 'latest'
              ? latest
              : categoryStories[section.categorySlug || ''] || [];
        const gridCards = Math.min(24, Math.max(2, settings?.listing?.cardsPerPage ?? 4));
        const sectionStories = sourceStories.slice(0, Math.max(1, section.limit || gridCards));

        return (
          <section key={section.id} className="section">
            <div className="section-head">
              <h2>{section.title}</h2>
            </div>

            {section.source === 'latest' ? (
              <div className="list">
                {!loading && sectionStories.length === 0 ? (
                  <article className="list-item list-item-empty">
                    <div className="list-item-link">
                      <div className="list-item-copy">
                        <p className="card-meta">No stories yet</p>
                        <h3>New content will appear here soon.</h3>
                      </div>
                    </div>
                  </article>
                ) : null}
                {sectionStories.map((item) => (
                  <article key={item._id} className="list-item">
                    <Link className="list-item-link" to={`/${item.category?.slug || 'story'}/${item.slug}`}>
                      <div className="list-item-copy">
                        <p className="card-meta">
                          {item.category?.name || 'Story'} - {formatDate(item.publishedAt)}
                        </p>
                        <h3>{item.title}</h3>
                        <p>{item.excerpt}</p>
                      </div>
                      <div className="list-item-aside">
                        {item.featuredImage ? (
                          <img src={getImageUrl(item.featuredImage)} alt={item.title} />
                        ) : (
                          <span className="list-item-tag">Read story</span>
                        )}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="feed-grid">
                {loading ? (
                  <article className="feed-card feed-card-skeleton">
                    <div className="feed-media" />
                    <div className="feed-copy">
                      <p className="card-meta">Loading</p>
                      <h3>Fetching stories...</h3>
                    </div>
                  </article>
                ) : null}
                {sectionStories.map((item) => (
                  <Link key={item._id} className="feed-card" to={`/${item.category?.slug || 'story'}/${item.slug}`}>
                    <div className="feed-media">
                      {item.featuredImage ? (
                        <img src={getImageUrl(item.featuredImage)} alt={item.title} />
                      ) : (
                        <div className="feed-placeholder">{item.category?.name || 'Feature'}</div>
                      )}
                    </div>
                    <div className="feed-copy">
                      <p className="card-meta">{item.category?.name || 'Feature'}</p>
                      <h3>{item.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
      })}
      </div>
    </>
  );
}
