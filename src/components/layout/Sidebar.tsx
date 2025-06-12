'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, getVerticalColorClass } from '@/lib/utils';
import { LogoutButton } from '@/components/features/auth/LogoutButton';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import verticalsData from '@/data/verticals.json';
import { Vertical } from '@/lib/types';

interface UserProfileInSidebar {
  id: string;
  email: string;
  role: 'viewer' | 'editor' | 'super_admin';
}

interface SidebarProps {
  isMobileMenuOpen: boolean;
}

const menuItems = [
  { 
    href: '/dashboard',
    label: 'Домашняя страница',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  { 
    href: '/dashboard/analytics',
    label: 'Аналитика',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
  },
  { 
    href: '/dashboard/calendar',
    label: 'Календарь РК',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  // {
  //   href: '/dashboard/video',
  //   label: 'Видео',
  //   icon: (
  //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-5 8H5a2 2 0 01-2-2V6a2 2 0 012-2h5a2 2 0 012 2v10a2 2 0 01-2 2z" />
  //     </svg>
  //   ),
  // },
];

const getRoleDisplay = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'Супер администратор';
    case 'editor':
      return 'Редактор';
    case 'viewer':
      return 'Просмотр';
    default:
      return role;
  }
};

export function Sidebar({ isMobileMenuOpen }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfileInSidebar | null>(null);
  const [isVerticalsDropdownOpen, setIsVerticalsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();

      if (supabaseUser) {
        // Fetch user role from the 'user_roles' table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', supabaseUser.id)
          .single();

        if (roleError) {
          console.error('Error fetching user role:', roleError);
          // Fallback to 'viewer' if role cannot be fetched
          setUser({ id: supabaseUser.id, email: supabaseUser.email || '', role: 'viewer' });
        } else {
          setUser({ id: supabaseUser.id, email: supabaseUser.email || '', role: roleData.role });
        }
      } else {
        setUser(null);
      }
    };

    fetchUserAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Re-fetch profile on auth state change to ensure role is up-to-date
        fetchUserAndProfile(); 
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-gray-800 text-white p-4 transition-transform duration-300 z-50",
      isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
      "md:w-64 md:translate-x-0"
    )}>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Avito Gallery</h1>
      </div>

      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                  pathname === item.href
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-700',
                )}
              >
                {item.icon}
                <span className="block">{item.label}</span>
              </Link>
            </li>
          ))}

          {/* Verticals Dropdown */}
          {/* <li>
            <button
              onClick={() => setIsVerticalsDropdownOpen(!isVerticalsDropdownOpen)}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors w-full text-left',
                isVerticalsDropdownOpen
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-700',
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="block">Вертикали</span>
              {
                <svg
                  className={cn("w-4 h-4 ml-auto transition-transform", isVerticalsDropdownOpen ? "rotate-90" : "")}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            </button>
            {isVerticalsDropdownOpen && (
              <ul className="ml-8 mt-2 space-y-1">
                {(verticalsData as Vertical[]).map(vertical => (
                  <li key={vertical.id}>
                    <Link
                      href={`/dashboard/verticals/${encodeURIComponent(vertical.name)}`}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                        pathname === `/dashboard/verticals/${encodeURIComponent(vertical.name)}`
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-700',
                      )}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={getVerticalColorClass(vertical.name)}
                      ></div>
                      <span>{vertical.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li> */}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        {user ? (
          <div className="space-y-4">
            <Link href="/dashboard/profile" className="block">
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  👤
                </div>
                <div>
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-gray-400">{getRoleDisplay(user.role)}</p>
                </div>
              </div>
            </Link>
            <LogoutButton className="w-full" />
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            <span>Войти</span>
          </Link>
        )}
      </div>
    </aside>
  );
} 