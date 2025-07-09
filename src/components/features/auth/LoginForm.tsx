'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { logger } from '@/lib/logger';

export function LoginForm() {
  const router = useRouter();
  const [localEmailPart, setLocalEmailPart] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    logger.auth.debug('Starting login process');

    const fullEmail = `${localEmailPart}@avito.ru`;

    try {
      logger.auth.debug('Attempting to sign in', {
        email: fullEmail,
      });
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: fullEmail,
        password,
      });

      if (signInError) {
        logger.auth.error('Sign in error', signInError);
        throw signInError;
      }

      logger.auth.info('Sign in successful');

      // После успешного входа обновляем страницу
      router.refresh();
      router.push('/dashboard');
    } catch (error) {
      logger.auth.error('Login error', error);
      setError(
        error instanceof Error ? error.message : 'Произошла ошибка при входе'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
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
              autoComplete="current-password"
              required
              placeholder="Введите ваш пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          disabled={isLoading}
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </Button>
      </form>
    </div>
  );
}
