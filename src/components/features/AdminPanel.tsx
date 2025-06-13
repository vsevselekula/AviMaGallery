'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/Button';
import { UserData } from '@/lib/types';

export function AdminPanel() {
  const supabase = createClientComponentClient();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editedRole, setEditedRole] = useState('');

  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      setLoading(true);
      setError(null);

      const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();

      if (userError || !supabaseUser) {
        setError('Ошибка получения текущего пользователя.');
        setLoading(false);
        return;
      }

      const { data: currentUserRoleData, error: currentUserRoleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .single();

      if (currentUserRoleError || !currentUserRoleData || currentUserRoleData.role !== 'super_admin') {
        setError('Доступ запрещен. Только супер администраторы могут просматривать эту страницу.');
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      setIsSuperAdmin(true);

      // Fetch all users and their roles from the new API route
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        const errorData = await response.json();
        setError(`Ошибка получения пользователей: ${errorData.error || response.statusText}`);
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
        throw new Error(errorData.error || 'Ошибка обновления роли на сервере.');
      }

      setUsers(prevUsers =>
        prevUsers.map(user =>
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
    return <div className="text-white">Загрузка пользователей...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!isSuperAdmin) {
    return <div className="text-red-500">У вас нет прав для доступа к этой панели.</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-bold mb-4">Управление пользователями</h2>
      <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-600">
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Роль</th>
            <th className="py-2 px-4 text-left">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-t border-gray-600">
              <td className="py-2 px-4">{user.email}</td>
              <td className="py-2 px-4">
                {editingUserId === user.id ? (
                  <select
                    value={editedRole}
                    onChange={(e) => setEditedRole(e.target.value)}
                    className="bg-gray-600 border border-gray-500 rounded p-1 text-white"
                  >
                    <option value="super_admin">Супер администратор</option>
                    <option value="editor">Редактор</option>
                    <option value="viewer">Просмотр</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td className="py-2 px-4">
                {editingUserId === user.id ? (
                  <Button onClick={() => handleSaveRole(user.id)} className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded">
                    Сохранить
                  </Button>
                ) : (
                  <Button onClick={() => handleEditRole(user.id, user.role)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 rounded">
                    Редактировать
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 