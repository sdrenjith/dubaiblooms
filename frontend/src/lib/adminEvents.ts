/** Fired after category list changes so the admin sidebar can reload. */
export const ADMIN_CATEGORIES_UPDATED = 'dubaiblooms-admin-categories-updated';

export function notifyAdminCategoriesUpdated(): void {
  window.dispatchEvent(new CustomEvent(ADMIN_CATEGORIES_UPDATED));
}
