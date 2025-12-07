import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={inputId}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg bg-background border border-border',
            'text-text-primary placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent',
            'transition-all duration-200',
            error && 'border-gamma-negative focus:ring-gamma-negative',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-gamma-negative">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-text-tertiary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
