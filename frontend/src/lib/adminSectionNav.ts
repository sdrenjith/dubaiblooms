import type { Settings } from '@/types/api';

export const HOME_ADMIN_BASE = '/admin/pages/home';

export type HomeSidebarNavItem = {
  to: string;
  label: string;
  end?: boolean;
};

/** Sidebar entries under Home — paths match nested admin homepage routes. */
export function homeSidebarNavChunks(settings: Settings | null): HomeSidebarNavItem[] {
  const head: HomeSidebarNavItem[] = [
    { to: HOME_ADMIN_BASE, label: 'Overview', end: true },
    { to: `${HOME_ADMIN_BASE}/header`, label: 'Header' },
    { to: `${HOME_ADMIN_BASE}/tiles`, label: 'Topic tiles' },
  ];
  const dynamic = (settings?.homepage?.sections || []).map((section, index) => {
    const name = section.title?.trim() || section.id?.trim() || `Section ${index + 1}`;
    const tag =
      section.source === 'category' && section.categorySlug
        ? section.categorySlug
        : section.source
          ? section.source
          : null;
    const label = tag ? `${name} · ${tag}` : name;
    return {
      to: `${HOME_ADMIN_BASE}/sections/${index}`,
      label,
    };
  });
  const tail: HomeSidebarNavItem[] = [
    { to: `${HOME_ADMIN_BASE}/reviews`, label: 'Testimonial library' },
    { to: `${HOME_ADMIN_BASE}/layout-sections`, label: 'Sections & order' },
  ];
  return [...head, ...dynamic, ...tail];
}
