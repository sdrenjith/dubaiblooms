import type { ApiResponse, Article, Category, PaginatedArticlesResult, Settings } from '@/types/api';

function serverApiBaseUrl(): string {
  const raw = process.env.API_URL?.trim() || 'http://127.0.0.1:5000/api';
  const noTrail = raw.replace(/\/+$/, '');
  if (noTrail.endsWith('/api')) {
    return noTrail;
  }
  return `${noTrail}/api`;
}

function browserApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || '/api';
  return raw.replace(/\/+$/, '') || '/api';
}

export function apiBaseUrl(): string {
  return typeof window === 'undefined' ? serverApiBaseUrl() : browserApiBaseUrl();
}

async function getApi<T>(path: string, init?: RequestInit): Promise<ApiResponse<T> | null> {
  const res = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
    cache: init?.cache ?? 'no-store',
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as ApiResponse<T>;
}

async function postApi<T>(path: string, body: unknown): Promise<ApiResponse<T> | null> {
  const res = await fetch(`${browserApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as ApiResponse<T>;
}

export const contentApi = {
  settings: async (): Promise<Settings | null> => {
    const data = await getApi<Settings>('/settings');
    return data?.data ?? null;
  },
  categories: async (): Promise<Category[]> => {
    const data = await getApi<Category[]>('/categories');
    return data?.data ?? [];
  },
  categoryBySlug: async (slug: string): Promise<Category | null> => {
    const data = await getApi<Category>(`/categories/${encodeURIComponent(slug)}`);
    return data?.data ?? null;
  },
  featured: async (): Promise<Article[]> => {
    const data = await getApi<Article[]>('/articles/featured');
    return data?.data ?? [];
  },
  latest: async (limit = 8): Promise<Article[]> => {
    const data = await getApi<Article[]>(`/articles?limit=${encodeURIComponent(String(limit))}`);
    return data?.data ?? [];
  },
  searchArticles: async (query: string): Promise<Article[]> => {
    const data = await getApi<Article[]>(`/articles/search?q=${encodeURIComponent(query)}`);
    return data?.data ?? [];
  },
  articleBySlug: async (slug: string): Promise<{ article: Article | null; related: Article[] }> => {
    const data = await getApi<{ article: Article; related?: Article[] }>(`/articles/${encodeURIComponent(slug)}`);
    return {
      article: data?.data?.article ?? null,
      related: data?.data?.related ?? [],
    };
  },
  articlesByCategory: async (slug: string, page = 1, limit = 5): Promise<PaginatedArticlesResult> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const data = await getApi<{ articles: Article[] }>(`/articles/category/${encodeURIComponent(slug)}?${params}`);
    return {
      articles: data?.data?.articles ?? [],
      pagination: data?.pagination || { page: 1, limit, total: 0, pages: 1 },
    };
  },
  subscribeNewsletter: async (email: string): Promise<string> => {
    const data = await postApi<{ message?: string }>('/settings/subscribe', {
      email,
      source: 'website-footer',
    });
    return data?.message || 'Subscribed successfully.';
  },
};
