import axios from 'axios';
import type { ApiResponse, Article, Category, Settings } from '@/types/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const contentApi = {
  settings: async (): Promise<Settings | null> => {
    const { data } = await api.get<ApiResponse<Settings>>('/settings');
    return data?.data ?? null;
  },
  categories: async (): Promise<Category[]> => {
    const { data } = await api.get<ApiResponse<Category[]>>('/categories');
    return data?.data ?? [];
  },
  featured: async (): Promise<Article[]> => {
    const { data } = await api.get<ApiResponse<Article[]>>('/articles/featured');
    return data?.data ?? [];
  },
  latest: async (limit = 8): Promise<Article[]> => {
    const { data } = await api.get<ApiResponse<Article[]>>('/articles', {
      params: { limit },
    });
    return data?.data ?? [];
  },
  articleBySlug: async (slug: string): Promise<Article | null> => {
    const { data } = await api.get<ApiResponse<{ article: Article }>>(`/articles/${slug}`);
    return data?.data?.article ?? null;
  },
  articlesByCategory: async (slug: string): Promise<Article[]> => {
    const { data } = await api.get<ApiResponse<{ articles: Article[] }>>(`/articles/category/${slug}`);
    return data?.data?.articles ?? [];
  },
};
