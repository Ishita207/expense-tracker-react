import { getCategoryMeta } from '../constants/categories';

function CategoryLabel({ category, className = '' }) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`.trim()}>
      <span
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] leading-none"
        style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
        aria-hidden="true"
      >
        <Icon size={22} weight="duotone" />
      </span>
      <span>{getCategoryMeta(category).name}</span>
    </span>
  );
}

export default CategoryLabel;
