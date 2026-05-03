import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/admin/AdminLayout';

const HomePage = lazy(() => import('@/pages/HomePage'));
const ArticlePage = lazy(() => import('@/pages/ArticlePage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const LoginPage = lazy(() => import('@/pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const ArticlesPage = lazy(() => import('@/pages/admin/ArticlesPage'));
const ArticleEditorPage = lazy(() => import('@/pages/admin/ArticleEditorPage'));
const CategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      <span className="font-accent text-xs uppercase tracking-widest text-text-muted">Loading</span>
    </div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/:categorySlug/:slug" element={<ArticlePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="articles" element={<ArticlesPage />} />
                <Route path="articles/:id" element={<ArticleEditorPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </Suspense>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#ffffff',
                color: '#1a1a1a',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '16px',
                fontSize: '14px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
              },
              success: {
                iconTheme: { primary: '#b8942e', secondary: '#ffffff' },
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
