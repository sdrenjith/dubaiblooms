import type { SeoFields } from '@/types/seo';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order?: number;
  showInMainMenu?: boolean;
  seo?: SeoFields;
}

export interface Author {
  _id: string;
  name: string;
  slug?: string;
  bio?: string;
  avatar?: string;
}

export interface StoryMediaItem {
  url: string;
  type: 'image' | 'video';
  alt?: string;
  order?: number;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  media?: StoryMediaItem[];
  category: Category;
  author?: Author;
  tags?: string[];
  publishedAt?: string;
  readingTime?: number;
  views?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
  seo?: SeoFields;
}

export interface Settings {
  siteName: string;
  tagline: string;
  logo: string;
  favicon?: string;
  footerText: string;
  /** HTML for the public Privacy Policy page. */
  privacyPolicyHtml?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  notifications?: {
    enabled?: boolean;
    title?: string;
    message?: string;
  };
  listing?: {
    cardsPerPage?: number;
  };
  seoDefaults?: SeoFields;
  pageSeo?: {
    home?: SeoFields;
  };
  homepage?: {
    heroAutoplayMs?: number;
    /** Homepage hero: spotlight cards, featured articles, or latest published. */
    heroSource?: 'cards' | 'featured' | 'latest';
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
    heroCards?: Array<{
      heroImageUrl?: string;
      heroTag?: string;
      heroTitle?: string;
      heroExcerpt?: string;
      heroButtonLabel?: string;
      heroLink?: string;
    }>;
    categoryTiles?: Array<{
      title: string;
      subtitle: string;
      slug: string;
    }>;
    sections?: Array<{
      id: string;
      title: string;
      subtitle: string;
      source: 'featured' | 'latest' | 'category' | 'reviews';
      categorySlug?: string;
      limit: number;
    }>;
    googleReviews?: Array<{
      author: string;
      rating: number;
      review: string;
      location: string;
      postedAt: string;
    }>;
  };
}

export interface PaginatedArticlesResult {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
