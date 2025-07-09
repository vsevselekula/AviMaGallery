'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { logger } from '@/lib/logger';
import { Verify2FA } from './Verify2FA';
import { Setup2FA } from './Setup2FA';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localEmailPart, setLocalEmailPart] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [requireSetup, setRequireSetup] = useState(false);
  const [require2FAMessage, setRequire2FAMessage] = useState<string | null>(null);

  useEffect(() => {
    // Проверяем параметр require2fa из URL
    const require2fa = searchParams?.get('require2fa');
    const redirectedFrom = searchParams?.get('redirectedFrom');
    
    if (require2fa === 'true') {
      setRequire2FAMessage(
        redirectedFrom 
          ? `Для доступа к ${redirectedFrom} требуется подтверждение 2FA. Пожалуйста, войдите заново.`
          : 'Для доступа к системе требуется подтверждение 2FA. Пожалуйста, войдите заново.'
      );
    }
  }, [searchParams]);

  const check2FAStatus = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const hasActiveFactor = data?.totp?.some(factor => factor.status === 'verified');
      return hasActiveFactor;
    } catch (error) {
      logger.auth.error('Error checking 2FA status:', error);
      return false;
    }
  };

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
        // Проверяем, требуется ли MFA
        if (signInError.message.includes('MFA') || signInError.message.includes('factor')) {
          setShowMFA(true);
          setIsLoading(false);
          return;
        }
        logger.auth.error('Sign in error', signInError);
        throw signInError;
      }

      logger.auth.info('Password authentication successful');

      // Проверяем статус 2FA после успешного входа по паролю
      const has2FA = await check2FAStatus();
      
      if (has2FA) {
        // Если 2FA настроена, требуем её подтверждение
        logger.auth.info('2FA detected, requiring verification');
        setShowMFA(true);
      } else {
        // Если 2FA НЕ настроена, принудительно требуем настройку
        logger.auth.info('2FA not configured, requiring setup');
        setRequireSetup(true);
        setShowSetup2FA(true);
      }

      setIsLoading(false);
    } catch (error) {
      logger.auth.error('Login error', error);
      setError(
        error instanceof Error ? error.message : 'Произошла ошибка при входе'
      );
      setIsLoading(false);
    }
  };

  const handleMFASuccess = () => {
    logger.auth.info('2FA verification successful, redirecting to dashboard');
    router.refresh();
    router.push('/dashboard');
  };

  const handle2FASetupComplete = () => {
    logger.auth.info('2FA setup completed, redirecting to dashboard');
    setShowSetup2FA(false);
    router.refresh();
    router.push('/dashboard');
  };

  const handleCancel = () => {
    setShowMFA(false);
    setShowSetup2FA(false);
    setRequireSetup(false);
    // Выходим из системы при отмене
    supabase.auth.signOut();
  };

  // Показываем принудительную настройку 2FA
  if (showSetup2FA) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-yellow-900/50 p-4 rounded-lg border border-yellow-500 mb-6">
          <h3 className="font-medium text-yellow-200 mb-2">
            🔒 Обязательная настройка двухфакторной аутентификации
          </h3>
          <p className="text-yellow-200 text-sm">
            Для обеспечения безопасности все пользователи должны настроить 2FA. 
            Вы не сможете продолжить работу без её настройки.
          </p>
        </div>
        
        <Setup2FA onSetupComplete={handle2FASetupComplete} />
        
        {!requireSetup && (
          <div className="text-center">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="text-sm"
            >
              Отмена
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Показываем MFA форму если требуется
  if (showMFA) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-500 mb-6">
          <h3 className="font-medium text-blue-200 mb-2">
            🔐 Подтверждение входа
          </h3>
          <p className="text-blue-200 text-sm">
            Пароль принят. Теперь введите код из приложения-аутентификатора для завершения входа.
          </p>
        </div>
        
        <Verify2FA
          onSuccess={handleMFASuccess}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {require2FAMessage && (
        <div className="bg-orange-900/50 p-4 rounded-lg border border-orange-500">
          <h3 className="font-medium text-orange-200 mb-2">
            🔐 Требуется подтверждение 2FA
          </h3>
          <p className="text-orange-200 text-sm">
            {require2FAMessage}
          </p>
        </div>
      )}
      
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
      
      <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-500">
        <h3 className="font-medium text-blue-200 mb-2">
          🔒 Безопасность Avito
        </h3>
        <p className="text-blue-200 text-sm">
          Все пользователи должны настроить двухфакторную аутентификацию для защиты корпоративных данных.
        </p>
      </div>
    </div>
  );
}
