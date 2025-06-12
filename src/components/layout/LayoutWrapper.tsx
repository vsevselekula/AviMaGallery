'use client';

import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className={cn(
        'flex-1 overflow-auto transition-all duration-300',
        isSidebarOpen ? 'lg:ml-64' : 'ml-0'
      )}>
        {children}
      </main>
    </div>
  );
} 