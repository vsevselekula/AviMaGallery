'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function RegisterForm() {
  const router = useRouter();
  const [localEmailPart, setLocalEmailPart] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    const fullEmail = `${localEmailPart}@avito.ru`;

    try {
      const { error } = await supabase.auth.signUp({
        email: fullEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      router.push('/auth/verify-email');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Произошла ошибка при регистрации'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 bg-gray-800 p-8 rounded-lg shadow-lg">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <div className="flex items-center">
              <Input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                placeholder="Введите ваш логин"
                value={localEmailPart}
                onChange={(e) => setLocalEmailPart(e.target.value)}
                className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 rounded-r-none"
              />
              <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-600 bg-gray-700 text-gray-400 text-sm h-10">
                @avito.ru
              </span>
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Пароль
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Введите ваш пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Подтвердите пароль
            </label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Подтвердите ваш пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-900/50 p-4 border border-red-500">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>
      </form>
    </div>
  );
}
