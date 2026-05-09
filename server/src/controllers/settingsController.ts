import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Settings from '../models/Settings.js';
import { DEFAULT_HOMEPAGE } from '../seed/homepageDefaults.js';

function mongoErrMessage(err: unknown): string {
  if (err instanceof mongoose.Error.ValidationError) {
    return Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Server error';
}

function isHomepageEmpty(homepage: {
  categoryTiles?: unknown[];
  sections?: unknown[];
  googleReviews?: unknown[];
}): boolean {
  const tiles = homepage?.categoryTiles?.length ?? 0;
  const sections = homepage?.sections?.length ?? 0;
  const reviews = homepage?.googleReviews?.length ?? 0;
  return tiles === 0 && sections === 0 && reviews === 0;
}

function heroCardsMissingOrEmpty(homepage: unknown): boolean {
  if (!homepage || typeof homepage !== 'object') {
    return true;
  }
  const hc = (homepage as { heroCards?: unknown }).heroCards;
  return !Array.isArray(hc) || hc.length === 0;
}

/** Prefer DB array; else lift legacy `header` hero fields into one card; else seed defaults. */
function resolveHeroCardsForBackfill(homepage: Record<string, unknown>): unknown[] {
  const raw = homepage.heroCards;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw;
  }
  const header = homepage.header;
  if (header && typeof header === 'object' && !Array.isArray(header)) {
    const h = header as Record<string, unknown>;
    const hasLegacy =
      String(h.heroTitle ?? '').trim() ||
      String(h.heroImageUrl ?? '').trim() ||
      String(h.heroTag ?? '').trim() ||
      String(h.heroExcerpt ?? '').trim() ||
      String(h.heroButtonLabel ?? '').trim() ||
      String(h.heroLink ?? '').trim();
    if (hasLegacy) {
      return [
        {
          heroImageUrl: String(h.heroImageUrl ?? ''),
          heroTag: String(h.heroTag ?? ''),
          heroTitle: String(h.heroTitle ?? ''),
          heroExcerpt: String(h.heroExcerpt ?? ''),
          heroButtonLabel: String(h.heroButtonLabel ?? ''),
          heroLink: String(h.heroLink ?? ''),
        },
      ];
    }
  }
  return DEFAULT_HOMEPAGE.heroCards;
}

/** Mongoose `schema.paths` uses dotted keys (e.g. `homepage.sections`), never top-level `homepage`. */
const TOP_LEVEL_PATCHABLE_KEYS = [
  'siteName',
  'logo',
  'tagline',
  'contactInfo',
  'socialLinks',
  'footerText',
  'notifications',
  'subscribers',
  'listing',
  'homepage',
] as const;

function normalizeHomepagePayload(hp: unknown): unknown {
  if (!hp || typeof hp !== 'object') {
    return hp;
  }
  const o = hp as Record<string, unknown>;
  const headerRaw = o.header;
  let header: unknown = headerRaw;
  if (headerRaw && typeof headerRaw === 'object') {
    const { _id, ...rest } = headerRaw as Record<string, unknown>;
    header = rest;
  }

  const heroCards = Array.isArray(o.heroCards)
    ? o.heroCards.map((c) => {
        if (!c || typeof c !== 'object') {
          return c;
        }
        const { _id, ...rest } = c as Record<string, unknown>;
        return rest;
      })
    : o.heroCards;

  const hero = o.heroAutoplayMs;
  const heroAutoplayMs =
    typeof hero === 'string' ? Number(hero) : typeof hero === 'number' ? hero : undefined;

  const tiles = Array.isArray(o.categoryTiles)
    ? o.categoryTiles.map((t) => {
        if (!t || typeof t !== 'object') {
          return t;
        }
        const { _id, ...rest } = t as Record<string, unknown>;
        return rest;
      })
    : o.categoryTiles;

  const reviews = Array.isArray(o.googleReviews)
    ? o.googleReviews.map((r) => {
        if (!r || typeof r !== 'object') {
          return r;
        }
        const { _id, ...rest } = r as Record<string, unknown>;
        return rest;
      })
    : o.googleReviews;

  const sections = o.sections;
  const normalizedSections = Array.isArray(sections)
    ? sections.map((raw) => {
        if (!raw || typeof raw !== 'object') {
          return raw;
        }
        const s = raw as Record<string, unknown>;
        const lim = s.limit;
        const n = typeof lim === 'string' ? Number(lim) : typeof lim === 'number' ? lim : 6;
        const { _id, ...rest } = s;
        return { ...rest, limit: Number.isFinite(n) ? n : 6 };
      })
    : sections;

  return {
    ...o,
    header,
    heroCards,
    categoryTiles: tiles,
    googleReviews: reviews,
    ...(normalizedSections !== undefined ? { sections: normalizedSections } : {}),
    ...(heroAutoplayMs !== undefined && !Number.isNaN(heroAutoplayMs) ? { heroAutoplayMs } : {}),
  };
}

/** Plain object for merging (avoids losing nested fields when replacing `homepage`). */
function homepageToPlain(hp: unknown): Record<string, unknown> {
  if (!hp || typeof hp !== 'object') {
    return {};
  }
  const maybe = hp as { toObject?: (opts?: unknown) => Record<string, unknown> };
  if (typeof maybe.toObject === 'function') {
    return maybe.toObject({ flattenMaps: true });
  }
  return { ...(hp as Record<string, unknown>) };
}

/**
 * Merge incoming homepage PATCH onto the existing DB homepage so nested paths like `header.marqueeLines`
 * are not dropped when Mongoose replaces the subdocument (same robustness as dotted `$set` on sections).
 */
function mergeHomepageWithExisting(existingHp: unknown, incomingHp: unknown): unknown {
  const normalizedIncoming = normalizeHomepagePayload(incomingHp);
  if (!normalizedIncoming || typeof normalizedIncoming !== 'object') {
    return normalizedIncoming;
  }
  const inc = normalizedIncoming as Record<string, unknown>;
  const ex = homepageToPlain(existingHp);

  const exHeader =
    ex.header && typeof ex.header === 'object' && !Array.isArray(ex.header)
      ? { ...(ex.header as Record<string, unknown>) }
      : {};
  const incHeader =
    inc.header && typeof inc.header === 'object' && !Array.isArray(inc.header)
      ? (inc.header as Record<string, unknown>)
      : {};

  return {
    ...ex,
    ...inc,
    header: {
      ...exHeader,
      ...incHeader,
    },
  };
}

function normalizeSectionPatch(body: Record<string, unknown>): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  if (Object.prototype.hasOwnProperty.call(body, 'title')) {
    patch.title = String(body.title ?? '');
  }
  if (Object.prototype.hasOwnProperty.call(body, 'subtitle')) {
    patch.subtitle = String(body.subtitle ?? '');
  }
  if (Object.prototype.hasOwnProperty.call(body, 'source')) {
    patch.source = body.source;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'categorySlug')) {
    patch.categorySlug = String(body.categorySlug ?? '');
  }
  if (Object.prototype.hasOwnProperty.call(body, 'limit')) {
    const n = Number(body.limit);
    patch.limit = Number.isFinite(n) && n > 0 ? n : 6;
  }
  return patch;
}

async function getSettingsDocSingleton() {
  return Settings.findOne().sort({ _id: 1 });
}

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        success: false,
        message: `Database not connected (readyState=${mongoose.connection.readyState}). Check MONGODB_URI and that MongoDB is running.`,
      });
      return;
    }
    let settings = await getSettingsDocSingleton();
    if (!settings) {
      settings = await Settings.create({});
    }
    if (isHomepageEmpty(settings.homepage || {})) {
      const full = settings.toObject({ flattenMaps: true }) as { homepage?: Record<string, unknown> };
      const prevHp = { ...(full.homepage ?? {}) };
      const rawHeader = prevHp.header;
      const prevHeader =
        rawHeader && typeof rawHeader === 'object' && !Array.isArray(rawHeader)
          ? { ...(rawHeader as Record<string, unknown>) }
          : {};
      delete (prevHeader as { _id?: unknown })._id;

      const prevCards = prevHp.heroCards;
      const heroCards =
        Array.isArray(prevCards) && prevCards.length > 0 ? prevCards : DEFAULT_HOMEPAGE.heroCards;

      settings.set('homepage', {
        ...prevHp,
        heroAutoplayMs:
          (typeof prevHp.heroAutoplayMs === 'number' ? prevHp.heroAutoplayMs : undefined) ??
          DEFAULT_HOMEPAGE.heroAutoplayMs,
        header: prevHeader,
        heroCards,
        categoryTiles: DEFAULT_HOMEPAGE.categoryTiles,
        sections: DEFAULT_HOMEPAGE.sections,
        googleReviews: DEFAULT_HOMEPAGE.googleReviews,
      });
      try {
        await settings.save();
      } catch (mergeErr) {
        console.error('getSettings homepage backfill save failed', mergeErr);
        const reloaded = await Settings.findById(settings._id);
        if (reloaded) {
          settings = reloaded;
        }
      }
    }

    /** Hero cards were only filled when the whole homepage was empty; typical DBs have tiles/sections/reviews but no heroCards yet. */
    if (heroCardsMissingOrEmpty(settings.homepage)) {
      const full = settings.toObject({ flattenMaps: true }) as { homepage?: Record<string, unknown> };
      const prevHp = { ...(full.homepage ?? {}) };
      const heroCards = resolveHeroCardsForBackfill(prevHp);
      settings.set('homepage', {
        ...prevHp,
        heroCards,
      });
      settings.markModified('homepage');
      try {
        await settings.save();
      } catch (heroErr) {
        console.error('getSettings heroCards backfill save failed', heroErr);
      }
    }

    const plain = settings.toObject({ flattenMaps: true });
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.json({ success: true, data: plain });
  } catch (error) {
    console.error('getSettings', error);
    res.status(500).json({
      success: false,
      message: mongoErrMessage(error),
    });
  }
};

/** Apply whitelisted top-level keys with $set (schema.paths omits `homepage` / `listing`). */
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    let doc = await getSettingsDocSingleton();

    if (!doc) {
      doc = await Settings.create(body);
      const created = await Settings.findById(doc._id).lean();
      res.json({ success: true, data: created ?? doc.toObject() });
      return;
    }

    const $set: Record<string, unknown> = {};
    for (const key of TOP_LEVEL_PATCHABLE_KEYS) {
      if (!Object.prototype.hasOwnProperty.call(body, key)) {
        continue;
      }
      const value = body[key];
      if (value === undefined) {
        continue;
      }
      $set[key] =
        key === 'homepage' ? mergeHomepageWithExisting(doc.get('homepage'), value) : value;
    }

    if (Object.keys($set).length === 0) {
      const plain = doc.toObject({ flattenMaps: true });
      res.json({ success: true, data: plain });
      return;
    }

    for (const key of Object.keys($set)) {
      doc.set(key, $set[key]);
      doc.markModified(key);
    }

    const updatedDoc = await doc.save();
    const updated = updatedDoc.toObject({ flattenMaps: true });

    if (!updated) {
      res.status(500).json({ success: false, message: 'Settings update failed' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('updateSettings', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Server error',
    });
  }
};

export const updateHomepageSection = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        success: false,
        message: `Database not connected (readyState=${mongoose.connection.readyState}). Check MONGODB_URI and that MongoDB is running.`,
      });
      return;
    }

    const sectionIndex = Number(req.params.sectionIndex);
    if (!Number.isInteger(sectionIndex) || sectionIndex < 0) {
      res.status(400).json({ success: false, message: 'Invalid section index' });
      return;
    }

    const doc = await getSettingsDocSingleton();
    if (!doc) {
      res.status(404).json({ success: false, message: 'Settings not found' });
      return;
    }

    const sectionCount = doc.homepage?.sections?.length ?? 0;
    if (sectionIndex >= sectionCount) {
      res.status(404).json({ success: false, message: 'Homepage section not found' });
      return;
    }

    const patch = normalizeSectionPatch(req.body as Record<string, unknown>);
    if (Object.keys(patch).length === 0) {
      res.json({ success: true, data: doc.toObject({ flattenMaps: true }) });
      return;
    }

    const $set = Object.fromEntries(
      Object.entries(patch).map(([key, value]) => [`homepage.sections.${sectionIndex}.${key}`, value])
    );

    const updated = await Settings.findByIdAndUpdate(doc._id, { $set }, { new: true, runValidators: true }).lean();
    if (!updated) {
      res.status(500).json({ success: false, message: 'Homepage section update failed' });
      return;
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('updateHomepageSection', error);
    res.status(500).json({
      success: false,
      message: mongoErrMessage(error),
    });
  }
};

export const subscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: 'Valid email is required' });
      return;
    }

    let settings = await getSettingsDocSingleton();
    if (!settings) {
      settings = await Settings.create({});
    }

    const existing = settings.subscribers.find((sub) => sub.email.toLowerCase() === email);
    if (!existing) {
      settings.subscribers.push({
        email,
        subscribedAt: new Date(),
        source: String(req.body?.source || 'website-footer'),
      });
      await settings.save();
    }

    res.status(201).json({ success: true, message: 'Subscribed successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSubscribers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await Settings.findOne().sort({ _id: 1 }).lean();
    res.json({ success: true, data: settings?.subscribers || [] });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
