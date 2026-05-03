import axios from 'axios';
import type { Article, Category, Settings, ApiResponse, PaginatedResponse, DashboardStats } from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ user: any; token: string }>>('/auth/login', { email, password }),
  getMe: () => api.get<ApiResponse<{ user: any }>>('/auth/me'),
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
};

export const articlesAPI = {
  getAll: (params?: { page?: number; limit?: number; category?: string; featured?: string; tag?: string }) =>
    api.get<PaginatedResponse<Article>>('/articles', { params }),
  getFeatured: () =>
    api.get<ApiResponse<Article[]>>('/articles/featured'),
  getBySlug: (slug: string) =>
    api.get<ApiResponse<{ article: Article; related: Article[] }>>(`/articles/${slug}`),
  getByCategory: (categorySlug: string, params?: { page?: number; limit?: number }) =>
    api.get<any>(`/articles/category/${categorySlug}`, { params }),
  search: (q: string) =>
    api.get<ApiResponse<Article[]>>('/articles/search', { params: { q } }),
  getAllAdmin: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Article>>('/articles/admin/all', { params }),
  getStats: () =>
    api.get<ApiResponse<DashboardStats>>('/articles/admin/stats'),
  create: (data: any) =>
    api.post<ApiResponse<Article>>('/articles', data),
  update: (id: string, data: any) =>
    api.put<ApiResponse<Article>>(`/articles/${id}`, data),
  delete: (id: string) =>
    api.delete(`/articles/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get<ApiResponse<Category[]>>('/categories'),
  getBySlug: (slug: string) => api.get<ApiResponse<Category>>(`/categories/${slug}`),
  getWithArticles: () => api.get<ApiResponse<Category[]>>('/categories/with-articles'),
  create: (data: any) => api.post<ApiResponse<Category>>('/categories', data),
  update: (id: string, data: any) => api.put<ApiResponse<Category>>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const settingsAPI = {
  get: () => api.get<ApiResponse<Settings>>('/settings'),
  update: (data: any) => api.put<ApiResponse<Settings>>('/settings', data),
};

export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post<ApiResponse<{ url: string; filename: string }>>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
