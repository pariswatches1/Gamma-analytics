import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'positive' | 'negative' | 'neutral' | 'info';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-surface-hover text-text-secondary border-border',
      positive: 'bg-gamma-positive-bg text-gamma-positive border-gamma-positive/30',
      negative: 'bg-gamma-negative-bg text-gamma-negative border-gamma-negative/30',
      neutral: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      info: 'bg-accent-blue/10 text-accent-blue border-accent-blue/30',
    };

    const sizes = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-sm px-2.5 py-1',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-md border font-medium',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
