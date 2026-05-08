export interface ApiResponse<T> {
  success: boolean;
  data: T;
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
}
