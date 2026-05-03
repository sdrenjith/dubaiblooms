import { Link } from 'react-router-dom';

interface CategoryBadgeProps {
  name: string;
  slug: string;
  size?: 'sm' | 'md';
}

const CategoryBadge = ({ name, slug, size = 'sm' }: CategoryBadgeProps) => {
  const sizeClasses = size === 'sm'
    ? 'px-4 py-1.5 text-[10px]'
    : 'px-5 py-2 text-[11px]';

  return (
    <Link
      to={`/category/${slug}`}
      className={`inline-block ${sizeClasses} rounded-full font-accent font-semibold tracking-[0.15em] uppercase
        bg-primary/8 text-primary border border-primary/15
        hover:bg-primary/12 hover:border-primary/25
        transition-all duration-400`}
    >
      {name}
    </Link>
  );
};

export default CategoryBadge;
