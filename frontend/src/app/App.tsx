import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AppShell } from '@/components/layout/AppShell';
import { AdminCategoriesGridPage } from '@/pages/AdminCategoriesGridPage';
import { AdminCategoryHubPage } from '@/pages/AdminCategoryHubPage';
import { AdminCategoryInfoPage } from '@/pages/AdminCategoryInfoPage';
import { AdminCategoryLayout } from '@/pages/AdminCategoryLayout';
import { AdminCategoryStoriesPage } from '@/pages/AdminCategoryStoriesPage';
import { AdminHomeHeaderPage } from '@/pages/AdminHomeHeaderPage';
import { AdminHomeHubPage } from '@/pages/AdminHomeHubPage';
import { AdminHomeLayout } from '@/pages/AdminHomeLayout';
import { AdminHomeReviewsPage } from '@/pages/AdminHomeReviewsPage';
import { AdminHomeSectionPage } from '@/pages/AdminHomeSectionPage';
import { AdminHomeSectionsManagePage } from '@/pages/AdminHomeSectionsManagePage';
import { AdminHomeTilesPage } from '@/pages/AdminHomeTilesPage';
import { AdminNewsletterSubscribersPage } from '@/pages/AdminNewsletterSubscribersPage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { AdminResetPasswordPage } from '@/pages/AdminResetPasswordPage';
import { AdminSettingsPage } from '@/pages/AdminSettingsPage';
import { ArticlePage } from '@/pages/ArticlePage';
import { CategoryPage } from '@/pages/CategoryPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="settings" replace />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="newsletter" element={<AdminNewsletterSubscribersPage />} />
        <Route path="pages/home" element={<AdminHomeLayout />}>
          <Route index element={<AdminHomeHubPage />} />
          <Route path="header" element={<AdminHomeHeaderPage />} />
          <Route path="tiles" element={<AdminHomeTilesPage />} />
          <Route path="sections/:sectionIndex" element={<AdminHomeSectionPage />} />
          <Route path="reviews" element={<AdminHomeReviewsPage />} />
          <Route path="layout-sections" element={<AdminHomeSectionsManagePage />} />
        </Route>
        <Route path="pages/categories" element={<AdminCategoriesGridPage />} />
        <Route path="pages/category/:slug" element={<AdminCategoryLayout />}>
          <Route index element={<AdminCategoryHubPage />} />
          <Route path="info" element={<AdminCategoryInfoPage />} />
          <Route path="stories" element={<AdminCategoryStoriesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="settings" replace />} />
      </Route>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/:categorySlug/:slug" element={<ArticlePage />} />
        <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
