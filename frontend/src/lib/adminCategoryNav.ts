export function categoryAdminBase(slug: string): string {
  return `/admin/pages/category/${encodeURIComponent(slug)}`;
}

export type CategorySidebarNavItem = {
  to: string;
  label: string;
  end?: boolean;
};

export function categorySidebarNav(slug: string): CategorySidebarNavItem[] {
  const base = categoryAdminBase(slug);
  return [
    { to: base, label: 'Overview', end: true },
    { to: `${base}/info`, label: 'Category info' },
    { to: `${base}/stories`, label: 'Stories' },
  ];
}
