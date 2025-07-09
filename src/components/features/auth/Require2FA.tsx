'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Setup2FA } from './Setup2FA';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { logger } from '@/lib/logger';

interface Require2FAProps {
  children: React.ReactNode;
}

export function Require2FA({ children }: Require2FAProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [has2FA, setHas2FA] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const check2FAStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      // Проверяем аутентификацию
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        logger.auth.info('User not authenticated, redirecting to login');
        router.push('/auth/login');
        return;
      }

      setIsAuthenticated(true);

      // Проверяем AAL уровень
      const { data: aal } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aal && aal.currentLevel === 'aal2') {
        // Пользователь уже прошел 2FA верификацию
        setHas2FA(true);
        logger.auth.debug('User has valid 2FA authentication');
      } else {
        // Проверяем есть ли настроенные факторы
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const hasActiveFactor = factors?.totp?.some(
          (factor) => factor.status === 'verified'
        );

        if (hasActiveFactor) {
          // 2FA настроена, но не пройдена - перенаправляем на логин
          logger.auth.info(
            '2FA configured but not verified, redirecting to login'
          );
          await supabase.auth.signOut();
          router.push('/auth/login?require2fa=true');
        } else {
          // 2FA не настроена - требуем настройку
          logger.auth.info('2FA not configured, requiring setup');
          setHas2FA(false);
        }
      }
    } catch (error) {
      logger.auth.error('Error checking 2FA status:', error);
      // При ошибке перенаправляем на логин
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    check2FAStatus();
  }, [check2FAStatus]);

  // Обновляем статус при изменении аутентификации
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/auth/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        check2FAStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, [check2FAStatus, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gray-900">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-400 mt-4">Проверка безопасности...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gray-900">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-400 mt-4">Перенаправление...</p>
        </div>
      </div>
    );
  }

  if (!has2FA) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-red-900/50 p-6 rounded-lg border border-red-500 mb-6">
            <h2 className="text-xl font-bold text-red-200 mb-3">
              🔒 Обязательная настройка 2FA
            </h2>
            <p className="text-red-200 text-sm mb-3">
              В соответствии с политикой безопасности Avito, все пользователи
              обязаны настроить двухфакторную аутентификацию.
            </p>
            <p className="text-red-200 text-sm">
              Доступ к системе будет предоставлен только после настройки 2FA.
            </p>
          </div>

          <Setup2FA
            onSetupComplete={() => {
              logger.auth.info('2FA setup completed via Require2FA guard');
              setHas2FA(true);
            }}
          />

          <div className="mt-6 text-center">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/auth/login');
              }}
              className="text-sm text-gray-400 hover:text-gray-300 underline"
            >
              Выйти из системы
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
