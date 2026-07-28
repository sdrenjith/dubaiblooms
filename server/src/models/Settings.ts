import mongoose, { Schema, Document } from 'mongoose';
import { DEFAULT_PRIVACY_POLICY_HTML } from '../seed/privacyPolicyDefaults.js';
import { seoFieldsDefinition } from './seoFields.js';

export interface ISettings extends Document {
  siteName: string;
  logo: string;
  favicon: string;
  tagline: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  footerText: string;
  /** HTML body for the public Privacy Policy page (/privacy-policy). */
  privacyPolicyHtml: string;
  notifications: {
    enabled: boolean;
    title: string;
    message: string;
  };
  subscribers: Array<{
    email: string;
    subscribedAt: Date;
    source: string;
  }>;
  listing?: {
    cardsPerPage: number;
  };
  seoDefaults?: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
    keywords: string[];
    canonicalPath: string;
    noIndex: boolean;
  };
  pageSeo?: {
    home?: {
      metaTitle: string;
      metaDescription: string;
      ogImage: string;
      keywords: string[];
      canonicalPath: string;
      noIndex: boolean;
    };
  };
  homepage: {
    heroAutoplayMs: number;
    /** Homepage hero carousel source. Default `cards` preserves spotlight heroCards. */
    heroSource?: 'cards' | 'featured' | 'latest';
    heroCards?: Array<{
      heroImageUrl?: string;
      heroTag?: string;
      heroTitle?: string;
      heroExcerpt?: string;
      heroButtonLabel?: string;
      heroLink?: string;
    }>;
    header?: {
      topBarLeft?: string;
      topBarCenter?: string;
      marquee?: string;
      marqueeLines?: string[];
      heroImageUrl?: string;
      heroTag?: string;
      heroTitle?: string;
      heroExcerpt?: string;
      heroButtonLabel?: string;
      heroLink?: string;
    };
    categoryTiles: Array<{
      title: string;
      subtitle: string;
      slug: string;
    }>;
    sections: Array<{
      id: string;
      title: string;
      subtitle: string;
      source: 'featured' | 'latest' | 'category' | 'reviews';
      categorySlug?: string;
      limit: number;
    }>;
    googleReviews: Array<{
      author: string;
      rating: number;
      review: string;
      location: string;
      postedAt: string;
    }>;
  };
}

const settingsSchema = new Schema<ISettings>(
  {
    siteName: { type: String, default: 'Dubai Blooms' },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    tagline: { type: String, default: 'The Pulse of Dubai' },
    contactInfo: {
      email: { type: String, default: 'marketing@dubaiblooms.ae' },
      phone: { type: String, default: '+971 50 780 3538' },
      address: { type: String, default: 'Dubai, United Arab Emirates' },
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: 'https://www.instagram.com/dubai.blooms?igsh=MXM0bGR4ZGhhZjByNg==' },
      linkedin: { type: String, default: '' },
    },
    footerText: { type: String, default: '© 2026 Dubai Blooms. All rights reserved.' },
    privacyPolicyHtml: { type: String, default: DEFAULT_PRIVACY_POLICY_HTML },
    notifications: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'Latest Updates' },
      message: { type: String, default: 'Subscribe for exclusive Dubai stories and alerts.' },
    },
    subscribers: {
      type: [
        {
          email: { type: String, required: true },
          subscribedAt: { type: Date, default: Date.now },
          source: { type: String, default: 'website-footer' },
        },
      ],
      default: [],
    },
  listing: {
    cardsPerPage: { type: Number, default: 4, min: 2, max: 24 },
  },
  seoDefaults: {
    metaTitle: { type: String, default: 'Dubai Blooms — The Pulse of Dubai' },
    metaDescription: {
      type: String,
      default: 'Curated news, culture, lifestyle, food, travel, and things to do across Dubai.',
    },
    ogImage: { type: String, default: '' },
    keywords: { type: [String], default: [] },
    canonicalPath: { type: String, default: '' },
    noIndex: { type: Boolean, default: false },
  },
  pageSeo: {
    home: seoFieldsDefinition,
  },
  homepage: {
      heroAutoplayMs: { type: Number, default: 5000 },
      heroSource: {
        type: String,
        enum: ['cards', 'featured', 'latest'],
        default: 'cards',
      },
      heroCards: {
        type: [
          {
            heroImageUrl: { type: String, default: '' },
            heroTag: { type: String, default: '' },
            heroTitle: { type: String, default: '' },
            heroExcerpt: { type: String, default: '' },
            heroButtonLabel: { type: String, default: '' },
            heroLink: { type: String, default: '' },
          },
        ],
        default: [],
      },
      header: {
        type: {
          topBarLeft: { type: String, default: '' },
          topBarCenter: { type: String, default: '' },
          marquee: { type: String, default: '' },
          marqueeLines: { type: [String], default: undefined },
          heroImageUrl: { type: String, default: '' },
          heroTag: { type: String, default: '' },
          heroTitle: { type: String, default: '' },
          heroExcerpt: { type: String, default: '' },
          heroButtonLabel: { type: String, default: '' },
          heroLink: { type: String, default: '' },
        },
        default: () => ({}),
      },
      categoryTiles: {
        type: [
          {
            title: { type: String, required: true },
            subtitle: { type: String, required: true },
            slug: { type: String, required: true },
          },
        ],
        default: [
          { title: 'Latest updates', subtitle: 'Newsroom highlights', slug: 'news' },
          { title: 'Top experiences', subtitle: 'Things to do now', slug: 'things-to-do' },
          { title: 'Culinary delights', subtitle: 'Food and drink picks', slug: 'food-drink' },
          { title: 'Live well', subtitle: 'Lifestyle and wellness', slug: 'lifestyle' },
          { title: 'Art and heritage', subtitle: 'Culture essentials', slug: 'culture' },
          { title: 'Wander more', subtitle: 'Travel inspiration', slug: 'travel' },
        ],
      },
      sections: {
        type: [
          {
            id: { type: String, required: true },
            // Allow empty strings — admin UI can clear fields; required:true rejects '' in Mongoose.
            title: { type: String, default: '' },
            subtitle: { type: String, default: '' },
            source: { type: String, enum: ['featured', 'latest', 'category', 'reviews'], required: true },
            categorySlug: { type: String, default: '' },
            limit: { type: Number, default: 6 },
          },
        ],
        default: [
          {
            id: 'featured-grid',
            title: 'On the Move',
            subtitle: 'Daily city pulse, culture moments, and travel inspiration.',
            source: 'featured',
            limit: 6,
          },
          {
            id: 'culture-spotlight',
            title: 'Culture Spotlight',
            subtitle: 'Art, heritage, and exhibitions shaping Dubai this week.',
            source: 'category',
            categorySlug: 'culture',
            limit: 6,
          },
          {
            id: 'weekend-escapes',
            title: 'Weekend Escapes',
            subtitle: 'Smart getaway edits and things to do beyond routine.',
            source: 'category',
            categorySlug: 'travel',
            limit: 6,
          },
          {
            id: 'latest-stories',
            title: 'Latest Stories',
            subtitle: 'Updated continuously from the newsroom.',
            source: 'latest',
            limit: 12,
          },
          {
            id: 'google-reviews',
            title: 'Google Reviews',
            subtitle: 'What readers and visitors are saying about Dubai Blooms.',
            source: 'reviews',
            limit: 6,
          },
        ],
      },
      googleReviews: {
        type: [
          {
            author: { type: String, required: true },
            rating: { type: Number, min: 1, max: 5, required: true },
            review: { type: String, required: true },
            location: { type: String, required: true },
            postedAt: { type: String, required: true },
          },
        ],
        default: [
          {
            author: 'Amira K.',
            rating: 5,
            review: 'Beautifully curated Dubai updates. The weekend guides are genuinely useful and premium.',
            location: 'Dubai Marina',
            postedAt: '2 weeks ago',
          },
          {
            author: 'Rahul S.',
            rating: 5,
            review: 'The food and lifestyle stories are accurate, elegant, and easy to read. Great editorial quality.',
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
        ],
      },
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
export default Settings;
