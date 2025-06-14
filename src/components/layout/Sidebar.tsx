'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogoutButton } from '@/components/features/auth/LogoutButton';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface UserProfileInSidebar {
  id: string;
  email: string;
  role: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    href: '/dashboard',
    label: 'Домашняя страница',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: '/dashboard/analytics',
    label: 'Аналитика',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
        />
      </svg>
    ),
  },
  {
    href: '/dashboard/calendar',
    label: 'Календарь РК',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    href: '/dashboard/admin',
    label: 'Админ панель',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    adminOnly: true,
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

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfileInSidebar | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (pathname.startsWith('/auth')) {
      setUser(null);
      return;
    }

    const fetchUserAndProfile = async () => {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (supabaseUser) {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', supabaseUser.id)
          .single();

        if (roleError || !roleData?.role) {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            role: 'viewer',
          });
        } else {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            role: roleData.role,
          });
        }
      } else {
        setUser(null);
      }
    };

    fetchUserAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserAndProfile();
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, pathname]);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-gray-800 text-white p-4 transition-transform duration-300 z-50 w-64',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0' // На больших экранах всегда видимый
      )}
    >
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Avito Gallery</h1>
        <button
          onClick={onClose}
          className="md:hidden text-gray-400 hover:text-white"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            if (item.adminOnly && user?.role !== 'super_admin') {
              return null;
            }
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                    pathname === item.href
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-700'
                  )}
                >
                  {item.icon}
                  <span className="block">{item.label}</span>
                </Link>
              </li>
            );
          })}
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
                  <p className="text-xs text-gray-400">
                    {getRoleDisplay(user.role)}
                  </p>
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
