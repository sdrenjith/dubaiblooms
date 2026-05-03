export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  articles?: Article[];
}

export interface ArticleSEO {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: Category;
  tags: string[];
  author: { _id: string; name: string };
  publishedAt: string;
  isFeatured: boolean;
  isPublished: boolean;
  readingTime: number;
  views: number;
  seo: ArticleSEO;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  _id: string;
  siteName: string;
  logo: string;
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
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DashboardStats {
  stats: {
    totalArticles: number;
    publishedArticles: number;
    featuredArticles: number;
    totalCategories: number;
    totalViews: number;
  };
  recentArticles: Article[];
}
