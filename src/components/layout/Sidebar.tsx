'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Building2, Plus, Map as MapIcon, Users, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentPath: string;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Add Property', href: '/properties/add', icon: Plus },
  { name: 'Map View', href: '/map', icon: MapIcon },
  { name: 'Contacts', href: '/contacts', icon: Users },
];

export function Sidebar({ currentPath, onLogout, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity" 
          onClick={onClose} 
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] bg-gradient-brown text-white transition-transform duration-300 ease-in-out flex flex-col",
        "lg:translate-x-0 lg:static lg:h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <div>
            <h1 className="text-2xl font-display font-bold text-gold-400">Dayalwasi</h1>
            <p className="text-xs text-beige-200 uppercase tracking-widest">Properties</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-beige-200 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive 
                    ? "bg-white/10 text-gold-300" 
                    : "text-beige-100 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-beige-100 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
