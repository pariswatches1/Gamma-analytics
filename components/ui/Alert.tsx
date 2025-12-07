import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, children, onClose, ...props }, ref) => {
    const variants = {
      info: {
        container: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue-light',
        icon: Info,
      },
      success: {
        container: 'bg-gamma-positive-bg border-gamma-positive/30 text-gamma-positive-light',
        icon: CheckCircle,
      },
      warning: {
        container: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        icon: AlertTriangle,
      },
      error: {
        container: 'bg-gamma-negative-bg border-gamma-negative/30 text-gamma-negative-light',
        icon: AlertCircle,
      },
    };

    const { container, icon: Icon } = variants[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative flex gap-3 p-4 rounded-lg border',
          container,
          className
        )}
        {...props}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          {title && (
            <h5 className="font-medium mb-1">{title}</h5>
          )}
          <div className="text-sm opacity-90">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert };
