import axios from 'axios';
import type { ApiResponse, Article, Category, PaginatedArticlesResult, Settings, Subscriber } from '@/types/api';

/**
 * Server mounts routes at `/api/*`. Use relative `/api` in dev (Vite proxy) or set
 * VITE_API_URL to `http://host:port` (we append `/api`) or already `http://host:port/api`.
 */
function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (!raw) {
    return '/api';
  }
  const noTrail = raw.replace(/\/+$/, '');
  if (noTrail === '/api' || noTrail.endsWith('/api')) {
    return noTrail;
  }
  if (/^https?:\/\/[^/]+$/i.test(noTrail)) {
    return `${noTrail}/api`;
  }
  return noTrail;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

function requireApiData<T>(payload: ApiResponse<T> | undefined, action: string): T {
  if (!payload?.success || payload.data === undefined || payload.data === null) {
    throw new Error(payload?.message || `${action} failed`);
  }
  return payload.data;
}

export const contentApi = {
  settings: async (): Promise<Settings | null> => {
    const { data } = await api.get<ApiResponse<Settings>>('/settings');
    return data?.data ?? null;
  },
  categories: async (): Promise<Category[]> => {
    const { data } = await api.get<ApiResponse<Category[]>>('/categories');
    return data?.data ?? [];
  },
  categoryBySlug: async (slug: string): Promise<Category | null> => {
    try {
      const { data } = await api.get<ApiResponse<Category>>(`/categories/${encodeURIComponent(slug)}`);
      return data?.data ?? null;
    } catch {
      return null;
    }
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
  searchArticles: async (query: string): Promise<Article[]> => {
    const { data } = await api.get<ApiResponse<Article[]>>('/articles/search', {
      params: { q: query },
    });
    return data?.data ?? [];
  },
  articleBySlug: async (slug: string): Promise<{ article: Article | null; related: Article[] }> => {
    const { data } = await api.get<ApiResponse<{ article: Article; related?: Article[] }>>(`/articles/${slug}`);
    return {
      article: data?.data?.article ?? null,
      related: data?.data?.related ?? [],
    };
  },
  articlesByCategory: async (slug: string, page = 1, limit = 5): Promise<PaginatedArticlesResult> => {
    const { data } = await api.get<ApiResponse<{ articles: Article[] }>>(`/articles/category/${slug}`, {
      params: { page, limit },
    });
    return {
      articles: data?.data?.articles ?? [],
      pagination: data?.pagination || { page: 1, limit, total: 0, pages: 1 },
    };
  },
  subscribeNewsletter: async (email: string): Promise<string> => {
    const { data } = await api.post<{ success: boolean; message: string }>('/settings/subscribe', {
      email,
      source: 'website-footer',
    });
    return data.message;
  },
};

export interface AuthUser {
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: { name: string; email: string; role: string } }> => {
    const { data } = await api.post<ApiResponse<{ token: string; user: { name: string; email: string; role: string } }>>(
      '/auth/login',
      { email, password }
    );
    return data.data;
  },

  getMe: async (token: string): Promise<AuthUser> => {
    const { data } = await api.get<ApiResponse<{ user: AuthUser }>>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data.user;
  },

  listUsers: async (token: string): Promise<AdminUserRow[]> => {
    const { data } = await api.get<ApiResponse<AdminUserRow[]>>('/auth/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return requireApiData(data, 'Load users');
  },

  updateMyProfile: async (
    token: string,
    payload: { name?: string; currentPassword?: string; newPassword?: string }
  ): Promise<AuthUser> => {
    const { data } = await api.patch<ApiResponse<{ user: AuthUser }>>('/auth/me', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return requireApiData(data, 'Update profile').user;
  },

  requestPasswordReset: async (
    email: string
  ): Promise<{ message: string; resetToken?: string; resetUrl?: string }> => {
    const { data } = await api.post<ApiResponse<{ message: string; resetToken?: string; resetUrl?: string }>>(
      '/auth/forgot-password',
      { email }
    );
    return data.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const { data } = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, password });
    return data.data;
  },
};

/** POST multipart to `/upload`; avoids default JSON Content-Type on the shared axios instance. */
export async function uploadAdminImage(file: File, token: string): Promise<string> {
  const base = resolveApiBaseUrl().replace(/\/$/, '');
  const uploadUrl = `${base}/upload`;
  const body = new FormData();
  body.append('image', file);
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  const json = (await res.json()) as { success?: boolean; data?: { url?: string }; message?: string };
  if (!res.ok || !json?.success || !json.data?.url) {
    throw new Error(json?.message || `Upload failed (${res.status})`);
  }
  return json.data.url;
}

export const adminApi = {
  updateSettings: async (payload: Partial<Settings>, token: string): Promise<Settings> => {
    const { data } = await api.put<ApiResponse<Settings>>('/settings', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return requireApiData(data, 'Save settings');
  },
  updateHomepageSection: async (
    sectionIndex: number,
    payload: {
      title?: string;
      subtitle?: string;
      source?: 'featured' | 'latest' | 'category' | 'reviews';
      categorySlug?: string;
      limit?: number;
    },
    token: string
  ): Promise<Settings> => {
    const { data } = await api.put<ApiResponse<Settings>>(
      `/settings/homepage/sections/${sectionIndex}`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return requireApiData(data, 'Save homepage section');
  },
  getSubscribers: async (token: string): Promise<Subscriber[]> => {
    const { data } = await api.get<ApiResponse<Subscriber[]>>('/settings/subscribers', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data || [];
  },

  registerUser: async (
    payload: { name: string; email: string; password: string; role: 'admin' | 'editor' },
    token: string
  ): Promise<{ id: string; name: string; email: string; role: string }> => {
    const { data } = await api.post<
      ApiResponse<{ user: { id: string; name: string; email: string; role: string } }>
    >('/auth/register', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data.user;
  },

  updateCategory: async (
    id: string,
    payload: { name?: string; description?: string; image?: string; order?: number; showInMainMenu?: boolean },
    token: string
  ): Promise<Category> => {
    const { data } = await api.put<ApiResponse<Category>>(`/categories/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return requireApiData(data, 'Save category');
  },

  createCategory: async (
    payload: {
      name: string;
      description?: string;
      image?: string;
      order?: number;
      /** Default false via API/schema when omitted. */
      showInMainMenu?: boolean;
    },
    token: string
  ): Promise<Category> => {
    const { data } = await api.post<ApiResponse<Category>>('/categories', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return requireApiData(data, 'Create category');
  },

  createArticle: async (
    payload: {
      title: string;
      excerpt: string;
      featuredImage: string;
      category: string;
      content?: string;
      isPublished?: boolean;
      isFeatured?: boolean;
    },
    token: string
  ): Promise<Article> => {
    const body = {
      title: payload.title.trim(),
      excerpt: payload.excerpt.trim().slice(0, 300),
      featuredImage: payload.featuredImage.trim(),
      category: payload.category,
      content: payload.content?.trim() || '<p></p>',
      isPublished: payload.isPublished ?? true,
      isFeatured: payload.isFeatured ?? false,
      tags: [],
    };
    const { data } = await api.post<ApiResponse<Article>>('/articles', body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return requireApiData(data, 'Create article');
  },

  updateArticle: async (
    id: string,
    payload: {
      title?: string;
      excerpt?: string;
      featuredImage?: string;
      isFeatured?: boolean;
    },
    token: string
  ): Promise<Article> => {
    const { data } = await api.put<ApiResponse<Article>>(`/articles/${encodeURIComponent(id)}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return requireApiData(data, 'Save article');
  },
};
