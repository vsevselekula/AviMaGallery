'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/Button';
import { UserData } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import FeedbackManagement from './FeedbackManagement';

type AdminTab = 'users' | 'feedback';

export function AdminPanel() {
  const supabase = createClientComponentClient();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editedRole, setEditedRole] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user: supabaseUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !supabaseUser) {
        setError('Ошибка получения текущего пользователя.');
        setLoading(false);
        return;
      }

      const { data: currentUserRoleData, error: currentUserRoleError } =
        await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', supabaseUser.id)
          .single();

      if (
        currentUserRoleError ||
        !currentUserRoleData ||
        currentUserRoleData.role !== 'super_admin'
      ) {
        setError(
          'Доступ запрещен. Только супер администраторы могут просматривать эту страницу.'
        );
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      setIsSuperAdmin(true);

      // Fetch all users and their roles from the new API route
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        const errorData = await response.json();
        setError(
          `Ошибка получения пользователей: ${errorData.error || response.statusText}`
        );
        setLoading(false);
        return;
      }
      const usersData: UserData[] = await response.json();
      setUsers(usersData);
      setLoading(false);
    };

    fetchUsersAndRoles();
  }, [supabase]);

  const handleEditRole = (userId: string, currentRole: string) => {
    setEditingUserId(userId);
    setEditedRole(currentRole);
  };

  const handleSaveRole = async (userId: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: editedRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Ошибка обновления роли на сервере.'
        );
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: editedRole } : user
        )
      );
      setEditingUserId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления роли.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-white flex items-center justify-center h-full w-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!isSuperAdmin) {
    return (
      <div className="text-red-500">
        У вас нет прав для доступа к этой панели.
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      {/* Заголовок */}
      <div className="border-b border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-white">Админ-панель</h1>
      </div>

      {/* Табы */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            }`}
          >
            👥 Пользователи
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'feedback'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            }`}
          >
            💡 Заявки на улучшение
          </button>
        </nav>
      </div>

      {/* Контент табов */}
      <div className="p-6">
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Управление пользователями</h2>
            <div className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-600">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Роль
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-700 divide-y divide-gray-600">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-600">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {editingUserId === user.id ? (
                          <select
                            value={editedRole}
                            onChange={(e) => setEditedRole(e.target.value)}
                            className="border border-gray-500 rounded-lg px-3 py-1 text-sm bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="super_admin">Супер администратор</option>
                            <option value="editor">Редактор</option>
                            <option value="viewer">Просмотр</option>
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200 border border-blue-700">
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingUserId === user.id ? (
                          <Button
                            onClick={() => handleSaveRole(user.id)}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded-lg"
                          >
                            Сохранить
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleEditRole(user.id, user.role)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-lg"
                          >
                            Редактировать
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && <FeedbackManagement />}
      </div>
    </div>
  );
}
