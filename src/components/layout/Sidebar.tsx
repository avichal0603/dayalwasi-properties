'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Building2, Plus, Map as MapIcon, Users, LogOut, X, FolderOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GOOGLE_DRIVE_FOLDER_URL } from '@/lib/constants';

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
  { name: 'Admin & PIN', href: '/admin', icon: ShieldCheck },
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
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 shrink-0 bg-black/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-300 via-gold-500 to-amber-700 p-0.5 shadow-gold shrink-0">
              <div className="w-full h-full bg-brown-950 rounded-[10px] flex items-center justify-center">
                <span className="font-display text-lg font-bold text-gold-300">D</span>
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-display font-bold tracking-tight text-gold-metallic drop-shadow-sm">
                Dayalwasi
              </h1>
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] text-gold-200/90 tracking-[0.2em] font-semibold uppercase">
                  Properties
                </p>
                <span className="w-1 h-1 rounded-full bg-olive-400 shrink-0"></span>
                <span className="text-[9px] text-beige-200/80 font-sans tracking-wider uppercase">Dayalbagh</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-beige-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} />
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

          <a
            href={GOOGLE_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="nav-link flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-gold-300/90 hover:bg-white/10 hover:text-gold-200 border border-gold-400/20 mt-4 bg-white/5"
          >
            <div className="flex items-center gap-3">
              <FolderOpen size={20} className="text-gold-400" />
              <span className="font-medium">Drive Storage</span>
            </div>
            <ExternalLink size={15} className="text-gold-400/70" />
          </a>
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/10 shrink-0 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
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
