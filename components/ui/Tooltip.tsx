'use client';

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-surface-hover border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-surface-hover border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-surface-hover border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-surface-hover border-y-transparent border-l-transparent',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-3 py-2 text-sm text-text-primary bg-surface-hover rounded-lg shadow-lg',
            'animate-fade-in whitespace-nowrap',
            positions[position]
          )}
        >
          {content}
          <div
            className={cn(
              'absolute w-0 h-0 border-4',
              arrows[position]
            )}
          />
        </div>
      )}
    </div>
  );
}
