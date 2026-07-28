import mongoose from 'mongoose';
import { env } from '../config/env.js';
import Settings from '../models/Settings.js';
import { DEFAULT_HOMEPAGE, DEFAULT_LISTING } from './homepageDefaults.js';

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

async function run(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        siteName: 'Dubai Blooms',
        tagline: 'The Pulse of Dubai',
        listing: DEFAULT_LISTING,
        homepage: DEFAULT_HOMEPAGE,
      });
      console.log('✅ Created settings document with default homepage content.');
      return;
    }

    let changed = false;
    if (!settings.listing?.cardsPerPage) {
      settings.set('listing', { ...DEFAULT_LISTING, ...settings.listing });
      changed = true;
    }

    if (isHomepageEmpty(settings.homepage || {})) {
      settings.set('homepage', {
        ...DEFAULT_HOMEPAGE,
        ...(settings.homepage && typeof settings.homepage === 'object' ? settings.homepage : {}),
        categoryTiles: DEFAULT_HOMEPAGE.categoryTiles,
        sections: DEFAULT_HOMEPAGE.sections,
        googleReviews: DEFAULT_HOMEPAGE.googleReviews,
      });
      changed = true;
    }

    const hp = settings.homepage as { heroCards?: unknown[]; heroSource?: string } | undefined;
    const heroSource = hp?.heroSource;
    /** Only backfill spotlight cards when hero is cards-mode (or unset legacy). */
    const shouldSeedHeroCards = heroSource !== 'featured' && heroSource !== 'latest';
    if (shouldSeedHeroCards && (!Array.isArray(hp?.heroCards) || hp.heroCards.length === 0)) {
      settings.set('homepage.heroCards', DEFAULT_HOMEPAGE.heroCards);
      changed = true;
    }

    if (changed) {
      await settings.save();
      console.log('✅ Homepage defaults merged into existing settings.');
    } else {
      console.log('ℹ️  Homepage already has tiles, sections, or reviews — no changes.');
    }
  } finally {
    await mongoose.disconnect();
  }
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ ensureHomepageContent:', err);
  process.exit(1);
});
