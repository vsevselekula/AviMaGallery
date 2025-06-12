'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TestAccounts } from './TestAccounts';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    console.log('LoginForm - Starting login process...');

    try {
      console.log('LoginForm - Attempting to sign in with:', { email });
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('LoginForm - Sign in error:', signInError);
        throw signInError;
      }

      console.log('LoginForm - Sign in successful');
      
      // После успешного входа обновляем страницу
      router.refresh();
      router.push('/dashboard');
    } catch (error) {
      console.error('LoginForm - Error:', error);
      setError(error instanceof Error ? error.message : 'Произошла ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTestAccount = (email: string, password: string) => {
    console.log('LoginForm - Setting test account:', { email });
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Пароль
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Вход...' : 'Войти'}
        </Button>
      </form>

      <TestAccounts onUseAccount={handleUseTestAccount} />
    </div>
  );
} 