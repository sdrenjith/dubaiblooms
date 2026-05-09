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
}

export interface Author {
  _id: string;
  name: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: Category;
  author?: Author;
  tags?: string[];
  publishedAt?: string;
  readingTime?: number;
  views?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
}

export interface Settings {
  siteName: string;
  tagline: string;
  logo: string;
  footerText: string;
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
  subscribers?: Array<{
    email: string;
    subscribedAt?: string;
    source?: string;
  }>;
  listing?: {
    cardsPerPage?: number;
  };
  homepage?: {
    heroAutoplayMs?: number;
    /** Top bar + marquee; legacy hero image/copy may still exist here until migrated to `heroCards`. */
    header?: {
      topBarLeft?: string;
      topBarCenter?: string;
      /** @deprecated Prefer `marqueeLines`; kept for older documents. */
      marquee?: string;
      /** Ordered ticker lines; shown on the homepage joined with · when set. Empty uses automatic ticker. */
      marqueeLines?: string[];
      heroImageUrl?: string;
      heroTag?: string;
      heroTitle?: string;
      heroExcerpt?: string;
      heroButtonLabel?: string;
      heroLink?: string;
    };
    /** Dynamic hero spotlights (DB-driven). When non-empty, homepage hero uses these instead of featured articles. */
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

export interface Subscriber {
  email: string;
  subscribedAt?: string;
  source?: string;
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
