'use client';

import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import FeedbackButton from '@/components/ui/FeedbackButton';
import { ReactionsProvider } from '@/contexts/ReactionsContext';
import { QueryProvider } from '@/components/providers/QueryProvider';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Устанавливаем начальное состояние
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showSidebar = !pathname.startsWith('/auth');

  return (
    <QueryProvider>
      <ReactionsProvider>
        <div className="flex h-screen bg-gray-900">
          {showSidebar && (
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Кнопка бургер меню */}
          {showSidebar && !isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors lg:hidden"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          <main
            className={cn(
              'flex-1 overflow-auto transition-all duration-300',
              showSidebar && isSidebarOpen ? 'lg:ml-64' : 'ml-0'
            )}
          >
            {children}
          </main>

          {/* Плавающая кнопка обратной связи */}
          {showSidebar && <FeedbackButton />}
        </div>
      </ReactionsProvider>
    </QueryProvider>
  );
}
