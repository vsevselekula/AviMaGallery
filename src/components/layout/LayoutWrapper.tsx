'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-gray-900">
      {!isAuthPage && (
        <>
          <button 
            className="md:hidden fixed top-4 left-4 z-50 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
          )}
          <Sidebar isMobileMenuOpen={isMobileMenuOpen} />
        </>
      )}
      <main className={cn(
        "flex-1",
        !isAuthPage ? "md:ml-64" : ""
      )}>
        <div className="mx-auto max-w-screen-xl p-4">
          {children}
        </div>
      </main>
    </div>
  );
} 