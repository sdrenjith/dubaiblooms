/** Fired after category list changes so the admin sidebar can reload. */
export const ADMIN_CATEGORIES_UPDATED = 'dubaiblooms-admin-categories-updated';

export function notifyAdminCategoriesUpdated(): void {
  window.dispatchEvent(new CustomEvent(ADMIN_CATEGORIES_UPDATED));
}

/** Fired after site settings (e.g. logo) change so the admin shell can refresh branding. */
export const ADMIN_SITE_SETTINGS_UPDATED = 'dubaiblooms-admin-site-settings-updated';

export function notifyAdminSiteSettingsUpdated(): void {
  window.dispatchEvent(new CustomEvent(ADMIN_SITE_SETTINGS_UPDATED));
}
