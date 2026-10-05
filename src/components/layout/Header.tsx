import React from 'react';
import { Menu, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  onSearch?: (query: string) => void;
}

export function Header({ title, onMenuClick, onSearch }: HeaderProps) {
  return (
    <header className="h-16 bg-beige-50 border-b border-brown-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-brown-800 hover:text-gold-600 p-1"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-display font-semibold text-brown-900">{title}</h1>
      </div>
      
      {onSearch && (
        <div className="relative max-w-xs w-full hidden sm:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-brown-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search..." 
            className="input-field pl-10 h-10 w-full"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}
    </header>
  );
}
