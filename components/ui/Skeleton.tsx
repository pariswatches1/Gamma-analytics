import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-surface-hover',
        className
      )}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-5 rounded-xl bg-surface border border-border animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="p-5 rounded-xl bg-surface border border-border animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="h-[300px] flex items-end justify-around gap-2 pt-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="p-5 rounded-xl bg-surface border border-border animate-fade-in">
      <Skeleton className="h-5 w-40 mb-4" />
      <div className="space-y-3">
        <div className="flex gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
