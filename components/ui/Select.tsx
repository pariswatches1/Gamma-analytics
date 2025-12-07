import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg bg-background border border-border',
            'text-text-primary',
            'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent',
            'transition-all duration-200 appearance-none cursor-pointer',
            'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E")] bg-no-repeat bg-[center_right_1rem] bg-[length:1.25rem]',
            error && 'border-gamma-negative focus:ring-gamma-negative',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-gamma-negative">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
