import { cn } from "@/lib/utils";

interface FilterBadgeProps {
  className?: string;
  count: number;
}

const FilterBadge = ({ className, count }: FilterBadgeProps) => {
  if (count === 0) return null;

  return (
    <span
      className={cn(
        "ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground",
        className
      )}
    >
      {count}
    </span>
  );
};

export default FilterBadge;
