import type { Settings } from '@/types/api';

/** One homepage hero spotlight (image + copy). Persisted as `homepage.heroCards`. */
export type HomepageHeroCard = {
  heroImageUrl?: string;
  heroTag?: string;
  heroTitle?: string;
  heroExcerpt?: string;
  heroButtonLabel?: string;
  heroLink?: string;
};

export type HomepageHeroSource = 'cards' | 'featured' | 'latest';

export const emptyHeroCard: HomepageHeroCard = {
  heroImageUrl: '',
  heroTag: '',
  heroTitle: '',
  heroExcerpt: '',
  heroButtonLabel: '',
  heroLink: '',
};

/** Resolve homepage hero source; missing value defaults to `cards` (legacy spotlight behavior). */
export function resolveHomepageHeroSource(homepage?: Settings['homepage']): HomepageHeroSource {
  const raw = homepage?.heroSource;
  if (raw === 'featured' || raw === 'latest' || raw === 'cards') {
    return raw;
  }
  return 'cards';
}

/** Non-empty custom marquee lines from saved settings (prefers `marqueeLines`, then legacy `marquee`). */
export function normalizeMarqueeLinesFromHeader(
  raw?: NonNullable<Settings['homepage']>['header']
): string[] {
  const linesArr = raw?.marqueeLines;
  if (Array.isArray(linesArr)) {
    const trimmed = linesArr.map((x) => String(x ?? '').trim()).filter(Boolean);
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  const legacy = raw?.marquee?.trim();
  if (legacy) {
    return [legacy];
  }
  return [];
}

/** Top utility bar + marquee only (legacy single-hero fields live on `header` until migrated). */
export function headerBarOnly(raw?: NonNullable<Settings['homepage']>['header']): {
  topBarLeft: string;
  topBarCenter: string;
  marquee: string;
  marqueeLines: string[];
} {
  const topBarLeft = raw?.topBarLeft ?? '';
  const topBarCenter = raw?.topBarCenter ?? '';
  const legacyMarquee = raw?.marquee ?? '';
  const linesArr = raw?.marqueeLines;
  let marqueeLines: string[];
  if (Array.isArray(linesArr) && linesArr.length > 0) {
    marqueeLines = linesArr.map((x) => String(x ?? ''));
  } else if (legacyMarquee.trim()) {
    marqueeLines = [legacyMarquee];
  } else {
    marqueeLines = [];
  }
  return {
    topBarLeft,
    topBarCenter,
    marquee: legacyMarquee,
    marqueeLines,
  };
}

/** Strip empty marquee rows and clear legacy `marquee` before PATCH so Mongo stores one source of truth. */
export function sanitizeHomepageForPersist(hp: Settings['homepage']): Settings['homepage'] {
  const header = hp?.header;
  if (!header) {
    return hp;
  }
  const lines = Array.isArray(header.marqueeLines)
    ? header.marqueeLines.map((x) => String(x ?? '').trim()).filter(Boolean)
    : [];
  return {
    ...hp,
    header: {
      ...header,
      marquee: '',
      marqueeLines: lines,
    },
  };
}

/**
 * Resolves hero cards from `homepage.heroCards`, or lifts legacy `homepage.header` hero fields into one card.
 */
export function normalizeHeroCardsFromHomepage(homepage?: Settings['homepage']): HomepageHeroCard[] {
  if (!homepage) {
    return [];
  }
  const raw = homepage.heroCards;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((c) => ({ ...emptyHeroCard, ...c }));
  }
  const h = homepage.header;
  if (
    h &&
    (h.heroTitle?.trim() ||
      h.heroImageUrl?.trim() ||
      h.heroTag?.trim() ||
      h.heroExcerpt?.trim() ||
      h.heroButtonLabel?.trim() ||
      h.heroLink?.trim())
  ) {
    return [
      {
        ...emptyHeroCard,
        heroImageUrl: h.heroImageUrl || '',
        heroTag: h.heroTag || '',
        heroTitle: h.heroTitle || '',
        heroExcerpt: h.heroExcerpt || '',
        heroButtonLabel: h.heroButtonLabel || '',
        heroLink: h.heroLink || '',
      },
    ];
  }
  return [];
}

export function heroCardHasContent(c: HomepageHeroCard): boolean {
  return Boolean(
    c.heroTitle?.trim() ||
      c.heroImageUrl?.trim() ||
      c.heroTag?.trim() ||
      c.heroExcerpt?.trim() ||
      c.heroButtonLabel?.trim() ||
      c.heroLink?.trim()
  );
}

/** Same ticker copy as the public homepage (custom marquee, then notifications, then tagline + spotlight). */
export function resolveMarqueeTickerText(options: {
  customMarquee?: string;
  siteName?: string;
  tagline?: string;
  notifications?: Settings['notifications'];
  /** Static hero: title or tag from the active/first spotlight */
  staticHeroLine?: string;
  /** Featured carousel: current lead story title */
  leadStoryTitle?: string;
}): string {
  const custom = options.customMarquee?.trim();
  if (custom) {
    return custom;
  }
  const n = options.notifications;
  if (n?.enabled) {
    const title = n.title?.trim();
    const msg = n.message?.trim();
    if (title && msg) {
      return `${title} — ${msg}`;
    }
    if (msg) {
      return msg;
    }
    if (title) {
      return title;
    }
  }
  const site = options.siteName?.trim() || 'Dubai Blooms';
  const tag = options.tagline?.trim() || 'The Pulse of Dubai';
  const related = options.staticHeroLine?.trim() || options.leadStoryTitle?.trim();
  if (related) {
    return `${tag} · ${site} · Now spotlighting: ${related}`;
  }
  return `${tag} · ${site} · Fresh Dubai stories, culture, and travel updates`;
}

/**
 * Ordered marquee segments for the hero ticker: saved lines when present, otherwise one automatic line
 * (same rules as {@link resolveMarqueeTickerText}).
 */
export function resolveMarqueeTickerLines(options: {
  header?: NonNullable<Settings['homepage']>['header'];
  siteName?: string;
  tagline?: string;
  notifications?: Settings['notifications'];
  staticHeroLine?: string;
  leadStoryTitle?: string;
}): string[] {
  const custom = normalizeMarqueeLinesFromHeader(options.header);
  if (custom.length > 0) {
    return custom;
  }
  return [
    resolveMarqueeTickerText({
      siteName: options.siteName,
      tagline: options.tagline,
      notifications: options.notifications,
      staticHeroLine: options.staticHeroLine,
      leadStoryTitle: options.leadStoryTitle,
    }),
  ];
}
