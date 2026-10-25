import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  ...props
}) => {
  const variantClasses = {
    circular: 'rounded-full',
    rounded: 'rounded-xl',
    rectangular: 'rounded-none'
  }[variant];

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden bg-slate-200/90 dark:bg-slate-800/80 animate-pulse ${variantClasses} ${className}`}
      {...props}
    >
      {/* Shimmer gradient wave reflection */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
    </div>
  );
};
