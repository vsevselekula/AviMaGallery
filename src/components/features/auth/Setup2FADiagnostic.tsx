'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { logger } from '@/lib/logger';

export function Setup2FADiagnostic() {
  const [diagnostics, setDiagnostics] = useState<{
    mfaAvailable: boolean | null;
    error: string | null;
    userAuthenticated: boolean | null;
    supabaseVersion: string | null;
    existingFactors: Array<{
      id: string;
      friendly_name?: string;
      status: string;
    }>;
    hasActiveFactors: boolean | null;
    enrollTest: string | null;
  }>({
    mfaAvailable: null,
    error: null,
    userAuthenticated: null,
    supabaseVersion: null,
    existingFactors: [],
    hasActiveFactors: null,
    enrollTest: null,
  });

  const [isChecking, setIsChecking] = useState(false);

  const runDiagnostics = async () => {
    setIsChecking(true);
    const newDiagnostics = {
      mfaAvailable: null as boolean | null,
      error: null as string | null,
      userAuthenticated: null as boolean | null,
      supabaseVersion: null as string | null,
      existingFactors: [] as Array<{
        id: string;
        friendly_name?: string;
        status: string;
      }>,
      hasActiveFactors: null as boolean | null,
      enrollTest: null as string | null,
    };

    try {
      // 1. Проверяем версию Supabase
      // @ts-expect-error - проверяем внутреннюю версию если доступна
      newDiagnostics.supabaseVersion = supabase?.['version'] || 'unknown';

      // 2. Проверяем аутентификацию пользователя
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      newDiagnostics.userAuthenticated = !!user && !authError;
      
      if (authError) {
        newDiagnostics.error = `Auth error: ${authError.message}`;
        setDiagnostics(newDiagnostics);
        return;
      }

      if (!user) {
        newDiagnostics.error = 'User not authenticated. Please log in first.';
        setDiagnostics(newDiagnostics);
        return;
      }

      // 3. Проверяем доступность MFA API
      try {
        if (!supabase.auth.mfa) {
          newDiagnostics.error = 'MFA methods not available in this Supabase version';
          newDiagnostics.mfaAvailable = false;
        } else if (!supabase.auth.mfa.listFactors) {
          newDiagnostics.error = 'MFA listFactors method not available';
          newDiagnostics.mfaAvailable = false;
        } else {
          // Пробуем список факторов
          const { data: factors, error: mfaError } = await supabase.auth.mfa.listFactors();
          
          if (mfaError) {
            if (mfaError.message.includes('MFA is not enabled')) {
              newDiagnostics.error = 'MFA не включена в Supabase Dashboard';
              newDiagnostics.mfaAvailable = false;
            } else {
              newDiagnostics.error = `MFA API error: ${mfaError.message}`;
              newDiagnostics.mfaAvailable = false;
            }
          } else {
            newDiagnostics.mfaAvailable = true;
            
            if (factors?.totp && factors.totp.length > 0) {
              newDiagnostics.existingFactors = factors.totp;
              newDiagnostics.hasActiveFactors = factors.totp.some(f => f.status === 'verified');
            } else {
              newDiagnostics.hasActiveFactors = false;
            }

            // 4. Тестируем enroll API
            try {
              logger.auth.info('Testing MFA enroll API...');
              
              const enrollTest = await supabase.auth.mfa.enroll({
                factorType: 'totp',
              });
              
              if (enrollTest.error) {
                // Проверяем код ошибки
                if (enrollTest.error.message.includes('already has this factor') || 
                    enrollTest.error.message.includes('already enrolled')) {
                  newDiagnostics.enrollTest = '✅ MFA API работает (уже есть фактор)';
                  newDiagnostics.error = null;
                } else {
                  newDiagnostics.enrollTest = `❌ Enroll Error: ${enrollTest.error.message}`;
                  newDiagnostics.mfaAvailable = false;
                }
              } else {
                // Если создался тестовый фактор, удаляем его
                if (enrollTest.data?.id) {
                  await supabase.auth.mfa.unenroll({ factorId: enrollTest.data.id });
                  newDiagnostics.enrollTest = '✅ MFA Enroll API полностью работает!';
                  newDiagnostics.error = null;
                }
              }
            } catch (enrollError) {
              const errorMessage = enrollError instanceof Error ? enrollError.message : 'Unknown error';
              newDiagnostics.enrollTest = `❌ Enroll Test Error: ${errorMessage}`;
              newDiagnostics.mfaAvailable = false;
              
              // Детальная диагностика ошибки 422
              if (enrollError instanceof Error && 'status' in enrollError) {
                const statusCode = (enrollError as Error & { status: number }).status;
                if (statusCode === 422) {
                  newDiagnostics.error = '422 Ошибка: Проверьте настройки MFA в Supabase Dashboard';
                } else {
                  newDiagnostics.error = `HTTP ${statusCode}: ${errorMessage}`;
                }
              } else {
                newDiagnostics.error = errorMessage;
              }
            }
          }
        }
      } catch (mfaCheckError: unknown) {
        const errorMessage = mfaCheckError instanceof Error ? mfaCheckError.message : 'Unknown error';
        newDiagnostics.error = `MFA check failed: ${errorMessage}`;
        newDiagnostics.mfaAvailable = false;
      }

    } catch (generalError: unknown) {
      const errorMessage = generalError instanceof Error ? generalError.message : 'Unknown error';
      newDiagnostics.error = `General error: ${errorMessage}`;
      logger.auth.error('Diagnostics failed:', generalError);
    } finally {
      setDiagnostics(newDiagnostics);
      setIsChecking(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return '⏳';
    return status ? '✅' : '❌';
  };

  const getStatusText = (status: boolean | null, successText: string, failText: string) => {
    if (status === null) return 'Проверка...';
    return status ? successText : failText;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          🔧 Диагностика 2FA
        </h2>
        <Button
          onClick={runDiagnostics}
          disabled={isChecking}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isChecking ? 'Проверка...' : 'Проверить снова'}
        </Button>
      </div>

      <div className="space-y-4">
        {/* Статус аутентификации */}
        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(diagnostics.userAuthenticated)}</span>
            <div>
              <h3 className="font-medium text-white">Аутентификация пользователя</h3>
              <p className="text-sm text-gray-400">
                {getStatusText(diagnostics.userAuthenticated, 'Пользователь аутентифицирован', 'Требуется вход в систему')}
              </p>
            </div>
          </div>
        </div>

        {/* Доступность MFA */}
        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(diagnostics.mfaAvailable)}</span>
            <div>
              <h3 className="font-medium text-white">Доступность MFA API</h3>
              <p className="text-sm text-gray-400">
                {getStatusText(diagnostics.mfaAvailable, 'MFA API работает корректно', 'MFA API недоступно')}
              </p>
            </div>
          </div>
        </div>

        {/* Версия Supabase */}
        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📦</span>
            <div>
              <h3 className="font-medium text-white">Версия Supabase</h3>
              <p className="text-sm text-gray-400">
                {diagnostics.supabaseVersion || 'Неизвестно'}
              </p>
            </div>
          </div>
        </div>

        {/* Тест Enroll API */}
        {diagnostics.enrollTest && (
          <div className="p-4 bg-purple-900/50 rounded border border-purple-500">
            <h3 className="font-medium text-purple-200 mb-2">🧪 Тест Enroll API:</h3>
            <p className="text-sm text-purple-200">{diagnostics.enrollTest}</p>
          </div>
        )}

        {/* Существующие факторы */}
        {diagnostics.existingFactors.length > 0 && (
          <div className="p-4 bg-blue-900/50 rounded border border-blue-500">
            <h3 className="font-medium text-blue-200 mb-2">🔐 Существующие 2FA факторы:</h3>
            <ul className="space-y-2">
              {diagnostics.existingFactors.map((factor) => (
                <li key={factor.id} className="text-sm text-blue-200 flex items-center justify-between">
                  <span>• {factor.friendly_name || 'Без названия'}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    factor.status === 'verified' 
                      ? 'bg-green-800 text-green-200' 
                      : 'bg-yellow-800 text-yellow-200'
                  }`}>
                    {factor.status}
                  </span>
                </li>
              ))}
            </ul>
            
            {diagnostics.hasActiveFactors && (
              <p className="text-sm text-green-200 mt-2">
                ✅ У вас есть активные 2FA факторы!
              </p>
            )}
          </div>
        )}

        {/* Сообщение об ошибке */}
        {diagnostics.error && (
          <div className="p-4 bg-red-900/50 rounded border border-red-500">
            <h3 className="font-medium text-red-200 mb-2">❌ Проблема:</h3>
            <p className="text-sm text-red-200">{diagnostics.error}</p>
          </div>
        )}

        {/* Инструкции по решению */}
        {diagnostics.mfaAvailable === false && (
          <div className="p-4 bg-yellow-900/50 rounded border border-yellow-500">
            <h3 className="font-medium text-yellow-200 mb-2">📋 Как исправить:</h3>
            <ol className="text-sm text-yellow-200 space-y-2 list-decimal list-inside">
              <li>Откройте <strong>Supabase Dashboard</strong></li>
              <li>Перейдите в <strong>Authentication → Settings</strong></li>
              <li>Найдите раздел <strong>"Multi-Factor Authentication (MFA)"</strong></li>
              <li>Включите <strong>"Enable MFA"</strong></li>
              <li>Выберите <strong>"TOTP (Time-based One-Time Password)"</strong></li>
              <li>Сохраните настройки и попробуйте снова</li>
            </ol>
          </div>
        )}

        {/* Успешная диагностика */}
        {diagnostics.mfaAvailable === true && diagnostics.userAuthenticated === true && (
          <div className="p-4 bg-green-900/50 rounded border border-green-500">
            <h3 className="font-medium text-green-200 mb-2">🎉 Всё готово!</h3>
            <p className="text-sm text-green-200">
              MFA API работает корректно. Можно настраивать двухфакторную аутентификацию.
            </p>
          </div>
        )}
      </div>

      {/* Дополнительная информация */}
      <div className="mt-6 p-4 bg-blue-900/50 rounded border border-blue-500">
        <h3 className="font-medium text-blue-200 mb-2">💡 Полезная информация:</h3>
        <ul className="text-sm text-blue-200 space-y-1 list-disc list-inside">
          <li>MFA в Supabase требует аутентифицированного пользователя</li>
          <li>TOTP работает с Google Authenticator, Authy, 1Password и другими</li>
          <li>После активации 2FA потребуется при каждом входе</li>
          <li>Ошибка 422 обычно означает, что MFA не включена в Dashboard</li>
        </ul>
      </div>
    </div>
  );
}