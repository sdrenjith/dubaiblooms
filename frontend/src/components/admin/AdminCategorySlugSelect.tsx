import type { Category } from '@/types/api';

type Props = {
  id?: string;
  categories: Category[];
  value: string;
  disabled?: boolean;
  onChange: (slug: string) => void;
};

export function AdminCategorySlugSelect({
  id = 'homepage-section-category-slug',
  categories,
  value,
  disabled,
  onChange,
}: Props) {
  const slugSet = new Set(categories.map((c) => c.slug));
  const known = Boolean(value && slugSet.has(value));

  return (
    <div className="admin-category-slug-select-wrap">
      <select
        id={id}
        aria-label="Category for this section"
        value={known ? value : ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— Choose category —</option>
        {categories.map((c) => (
          <option key={c._id} value={c.slug}>
            {c.name} ({c.slug})
          </option>
        ))}
      </select>
      {!known && value ? (
        <span className="lede admin-hint admin-category-slug-legacy">
          Saved slug <code>{value}</code> is not in the list — choose a category above to replace it.
        </span>
      ) : null}
    </div>
  );
}
