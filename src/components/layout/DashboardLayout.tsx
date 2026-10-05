'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loader2 } from 'lucide-react';
import AIChatbot from '../chat/AIChatbot';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  onSearch?: (query: string) => void;
}

export function DashboardLayout({ children, title = 'Dashboard', onSearch }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-50">
        <Loader2 className="w-12 h-12 text-gold-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-beige-100 overflow-hidden">
      <Sidebar 
        currentPath={pathname} 
        onLogout={logout} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header 
          title={title} 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onSearch={onSearch}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="page-container h-full">
            {children}
          </div>
        </main>
        {/* Global Floating AI Chatbot */}
        <AIChatbot />
      </div>
    </div>
  );
}
