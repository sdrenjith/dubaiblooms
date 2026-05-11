import type { Category } from '@/types/api';

/** Old DB rows without this field behave like they're shown (backward compatible). */
export function categoryVisibleInMainMenu(c: Pick<Category, 'showInMainMenu'>): boolean {
  return c.showInMainMenu !== false;
}
