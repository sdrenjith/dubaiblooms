import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ArticlePage } from '@/pages/ArticlePage';
import { CategoryPage } from '@/pages/CategoryPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/:categorySlug/:slug" element={<ArticlePage />} />
        <Route path="/admin/*" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
