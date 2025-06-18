import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  style?: React.CSSProperties;
}

const badgeVariants = {
  default: 'bg-gray-600 text-white',
  secondary: 'bg-gray-500 text-white',
  success: 'bg-green-600 text-white',
  warning: 'bg-yellow-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  style,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-colors',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
