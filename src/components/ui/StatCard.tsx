import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
  className?: string;
  href?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  color = 'text-gold-600 bg-gold-50',
  className,
  href,
}: StatCardProps) {
  const content = (
    <div
      className={cn(
        'glass-card p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 animate-slide-up min-w-0 border-beige-300/80 shadow-sm transition-all duration-200',
        href && 'hover:border-gold-400 hover:shadow-card-hover group cursor-pointer',
        className
      )}
    >
      <div
        className={cn(
          'w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200',
          color
        )}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] sm:text-xs text-brown-500 font-medium tracking-wide uppercase truncate mb-0.5 group-hover:text-gold-700 transition-colors">
          {label}
        </p>
        <h3
          className="text-lg sm:text-xl lg:text-2xl font-display text-brown-900 font-bold tracking-tight truncate"
          title={String(value)}
        >
          {value}
        </h3>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block min-w-0 focus:outline-none focus:ring-2 focus:ring-gold-400 rounded-2xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}
