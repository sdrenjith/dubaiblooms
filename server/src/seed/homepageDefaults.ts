/**
 * Canonical homepage payload for seed + non-destructive DB restore when arrays are empty.
 */
export const DEFAULT_HERO_CARDS = [
  {
    heroImageUrl: '',
    heroTag: 'CULTURE',
    heroTitle: 'Dubai Arts Season 2026: The Essential Guide to Open Studios & Waterfront Debuts',
    heroExcerpt:
      'The annual celebration of contemporary art returns with new commissions, district-wide installations, and performances framed against the Dubai skyline.',
    heroButtonLabel: 'Read full story',
    heroLink: '/culture/article-slug',
  },
  {
    heroImageUrl: '',
    heroTag: 'LIFESTYLE',
    heroTitle: 'After Hours Dubai: Rooftops, Jazz Rooms, and Late Dining Worth the Reservation',
    heroExcerpt:
      'Our editors mapped the rooms that stay luminous past midnight — from Marina terraces to Old Dubai courtyards — for elevated nights out in 2026.',
    heroButtonLabel: 'Read full story',
    heroLink: '/lifestyle/article-slug',
  },
  {
    heroImageUrl: '',
    heroTag: 'TRAVEL',
    heroTitle: 'Weekend Radius: Desert Capsules, Mountain Air, and Coastal Drives Within Three Hours',
    heroExcerpt:
      'Short escapes that feel worlds away: curated routes, stay picks, and slow-travel stops refreshed for the new season.',
    heroButtonLabel: 'Read full story',
    heroLink: '/travel/article-slug',
  },
];

export const DEFAULT_HOMEPAGE = {
  heroAutoplayMs: 5000,
  /** `cards` = spotlight heroCards; `featured` / `latest` = article-driven carousel. */
  heroSource: 'cards' as const,
  heroCards: DEFAULT_HERO_CARDS,
  categoryTiles: [
    { title: 'Latest updates', subtitle: 'Newsroom highlights', slug: 'news' },
    { title: 'Top experiences', subtitle: 'Things to do now', slug: 'things-to-do' },
    { title: 'Culinary delights', subtitle: 'Food and drink picks', slug: 'food-drink' },
    { title: 'Live well', subtitle: 'Lifestyle and wellness', slug: 'lifestyle' },
    { title: 'Art and heritage', subtitle: 'Culture essentials', slug: 'culture' },
    { title: 'Wander more', subtitle: 'Travel inspiration', slug: 'travel' },
  ],
  sections: [
    {
      id: 'featured-grid',
      title: 'On the Move',
      subtitle: 'Daily city pulse, culture moments, and travel inspiration.',
      source: 'featured' as const,
      limit: 4,
    },
    {
      id: 'culture-spotlight',
      title: 'Culture Spotlight',
      subtitle: 'Art, heritage, and exhibitions shaping Dubai this week.',
      source: 'category' as const,
      categorySlug: 'culture',
      limit: 4,
    },
    {
      id: 'weekend-escapes',
      title: 'Weekend Escapes',
      subtitle: 'Smart getaway edits and things to do beyond routine.',
      source: 'category' as const,
      categorySlug: 'travel',
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
  ],
  googleReviews: [
    {
      author: 'Amira K.',
      rating: 5,
      review:
        'Beautifully curated Dubai updates. The weekend guides are genuinely useful and premium.',
      location: 'Dubai Marina',
      postedAt: '2 weeks ago',
    },
    {
      author: 'Rahul S.',
      rating: 5,
      review:
        'The food and lifestyle stories are accurate, elegant, and easy to read. Great editorial quality.',
      location: 'Business Bay',
      postedAt: '1 month ago',
    },
    {
      author: 'Lina M.',
      rating: 4,
      review: 'Love the travel recommendations and local coverage. Smooth site experience as well.',
      location: 'Jumeirah',
      postedAt: '3 weeks ago',
    },
    {
      author: 'Nadia T.',
      rating: 5,
      review: 'Trusted source for things to do in Dubai. Very polished and editorially strong.',
      location: 'Downtown Dubai',
      postedAt: '5 days ago',
    },
    {
      author: 'Omar H.',
      rating: 5,
      review: 'Clean layout, strong photography, and stories that feel researched rather than rushed.',
      location: 'DIFC',
      postedAt: '1 week ago',
    },
    {
      author: 'Elena V.',
      rating: 4,
      review: 'The culture desk coverage is a standout — exhibition roundups are timely and well written.',
      location: 'Al Wasl',
      postedAt: '4 days ago',
    },
  ],
};

export const DEFAULT_LISTING = { cardsPerPage: 4 };
