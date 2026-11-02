import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
  className?: string;
}

export function StatCard({ icon: Icon, label, value, color = 'text-gold-600 bg-gold-50', className }: StatCardProps) {
  return (
    <div className={cn("glass-card p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 animate-slide-up min-w-0 border-beige-300/80 shadow-sm", className)}>
      <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm", color)}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] sm:text-xs text-brown-500 font-medium tracking-wide uppercase truncate mb-0.5">{label}</p>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-display text-brown-900 font-bold tracking-tight truncate" title={String(value)}>
          {value}
        </h3>
      </div>
    </div>
  );
}
