import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={cn('inline-flex items-center justify-center gap-2.5 text-gold-600', className)}>
      <Loader2 className={cn('animate-spin shrink-0', sizeClasses[size])} />
      {label && <span className="text-xs text-brown-600 font-medium">{label}</span>}
    </div>
  );
}

export default Spinner;
