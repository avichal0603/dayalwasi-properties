import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string; // Optional color class for the icon background, e.g., 'text-green-600 bg-green-100'
  className?: string;
}

export function StatCard({ icon: Icon, label, value, color = 'text-gold-600 bg-beige-200', className }: StatCardProps) {
  return (
    <div className={cn("glass-card p-6 flex items-center gap-4 animate-slide-up", className)}>
      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", color)}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-brown-600 font-medium">{label}</p>
        <h3 className="text-2xl font-display text-brown-900 font-bold">{value}</h3>
      </div>
    </div>
  );
}
