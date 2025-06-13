'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { supabase } from '@/lib/supabase'; // Assuming you have supabase client initialized
import { redirect } from 'next/navigation';

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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData?.user) {
        redirect('/auth/login');
      }

      const supabaseUser = userData.user;

      // Fetch user role from the 'user_roles' table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .single();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        setProfile({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          role: 'viewer', // Fallback to 'viewer' if role cannot be fetched
        });
      } else {
        const fetchedProfile: UserProfile = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          role: roleData.role, // Use the role from the user_roles table
        };
        setProfile(fetchedProfile);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
        <p className="text-white text-xl">Загрузка профиля...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
        <p className="text-white text-xl">
          Профиль не найден. Пожалуйста, войдите.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Мой профиль</h1>

      <div className="bg-gray-800 rounded-lg p-8 shadow-lg max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-5xl mb-4 overflow-hidden">
            <span>👤</span>
          </div>
        </div>

        {/* Display profile information (email and role) */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-300 text-sm font-bold mb-2"
            >
              Электронная почта
            </label>
            <p className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 disabled:opacity-70 disabled:cursor-not-allowed">
              {profile.email}
            </p>
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-gray-300 text-sm font-bold mb-2"
            >
              Роль на сервисе
            </label>
            <p className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 disabled:opacity-70 disabled:cursor-not-allowed">
              {getRoleDisplay(profile.role)}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
