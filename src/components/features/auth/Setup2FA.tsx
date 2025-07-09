'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { logger } from '@/lib/logger';

interface Setup2FAProps {
  onSetupComplete: () => void;
}

export function Setup2FA({ onSetupComplete }: Setup2FAProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verifyCode, setVerifyCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'generate' | 'verify'>('generate');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [existingFactors, setExistingFactors] = useState<Array<{
    id: string;
    friendly_name?: string;
    status: string;
  }>>([]);
  const [showExistingOptions, setShowExistingOptions] = useState(false);

  const checkExistingFactors = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactors = factors?.totp || [];
      setExistingFactors(totpFactors);
      return totpFactors;
    } catch (error) {
      logger.auth.error('Error checking existing factors:', error);
      return [];
    }
  };

  const generateQRCode = useCallback(async (forceCreate?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Сначала проверим аутентификацию
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Пользователь не аутентифицирован. Пожалуйста, войдите в систему.');
      }

      // Проверим доступность MFA API
      if (!supabase.auth.mfa || !supabase.auth.mfa.enroll) {
        throw new Error('MFA не поддерживается в этой версии Supabase');
      }

      // Проверим существующие факторы только если не принудительное создание
      if (forceCreate !== 'force') {
        const existingFactors = await checkExistingFactors();

        if (existingFactors.length > 0) {
          // Показываем варианты для существующего фактора
          setShowExistingOptions(true);
          setIsLoading(false);
          return;
        }
      }

      // Пытаемся создать фактор (сначала без имени, потом с уникальным если конфликт)
      let enrollResult = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      // Если конфликт имен, пробуем с уникальным именем
      if (enrollResult.error && 
          enrollResult.error.message.includes('already exists') &&
          ('code' in enrollResult.error && enrollResult.error.code === 'mfa_factor_name_conflict')) {
        
        logger.auth.info('Name conflict detected, retrying with unique name...');
        const uniqueName = `TOTP-${Date.now()}`;
        enrollResult = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: uniqueName,
        });
      }

      const { data, error } = enrollResult;

      if (error) {
        if (error.message.includes('MFA is not enabled')) {
          throw new Error('MFA не включена в Supabase Dashboard. Обратитесь к администратору или включите в Authentication → Settings → MFA');
        } else if (error.message.includes('already enrolled') || error.message.includes('already exists')) {
          // Если уже есть факторы, покажем варианты
          const factors = await checkExistingFactors(); // Обновим список
          if (factors.length > 0) {
            setError('У вас уже есть настроенные 2FA факторы. Выберите один из вариантов ниже.');
            setShowExistingOptions(true);
          } else {
            setError('Конфликт имен факторов. Попробуйте очистить проблемные факторы на странице диагностики.');
          }
          setIsLoading(false);
          return;
        } else {
          throw error;
        }
      }

      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
        // НЕ переключаем step автоматически - пользователь должен нажать "Я настроил приложение"
      }
    } catch (err) {
      logger.auth.error('2FA setup error:', err);
      const errorMessage = err instanceof Error ? err.message : '2FA setup failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyAndActivate = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    if (!factorId) {
      setError('Ошибка настройки. Попробуйте заново.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Создаем challenge для верификации
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factorId,
      });

      if (challengeError) throw challengeError;

      // Проверяем код
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: challenge.id,
        code: verifyCode,
      });

      if (verifyError) throw verifyError;

      logger.auth.info('2FA successfully activated');
      onSetupComplete();
    } catch (err) {
      logger.auth.error('2FA verification error:', err);
      setError(err instanceof Error ? err.message : 'Код неверный');
      setVerifyCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const removeExistingFactor = async (factorId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      
      logger.auth.info('Existing factor removed');
      // После удаления создаем новый
      await generateQRCode();
    } catch (error) {
      logger.auth.error('Error removing factor:', error);
      setError('Ошибка при удалении существующего фактора');
      setIsLoading(false);
    }
  };

  const useExistingFactor = () => {
    // Перенаправляем к настройкам профиля где можно управлять существующими факторами
    onSetupComplete();
  };

  useEffect(() => {
    checkExistingFactors().then(factors => {
      if (factors.length === 0) {
        generateQRCode();
      } else {
        setShowExistingOptions(true);
      }
    });
  }, [generateQRCode]);

  // Показываем варианты для существующих факторов
  if (showExistingOptions) {
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-4">
          2FA уже настроена
        </h2>
        
        <div className="space-y-4">
          <div className="bg-blue-900/50 p-4 rounded border border-blue-500">
            <p className="text-blue-200 text-sm mb-2">
              У вас уже есть настроенные факторы двухфакторной аутентификации:
            </p>
            <ul className="space-y-1">
                             {existingFactors.map((factor) => (
                 <li key={factor.id} className="text-blue-200 text-sm">
                   • {factor.friendly_name || 'Без названия'} ({factor.status})
                 </li>
               ))}
            </ul>
          </div>

          {error && (
            <div className="bg-red-900/50 p-3 rounded border border-red-500">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={useExistingFactor}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              Использовать существующую 2FA
            </Button>

            <Button
              onClick={() => {
                setShowExistingOptions(false);
                generateQRCode('force');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Создание...' : 'Создать дополнительную 2FA'}
            </Button>

            {existingFactors.length > 0 && (
              <Button
                onClick={() => removeExistingFactor(existingFactors[0].id)}
                variant="outline"
                className="w-full border-red-500 text-red-400 hover:bg-red-900/50"
                disabled={isLoading}
              >
                {isLoading ? 'Удаление...' : 'Удалить существующую и создать новую'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'generate') {
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-4">
          Настройка двухфакторной аутентификации
        </h2>
        
        <div className="space-y-4">
          <p className="text-gray-300">
            Сканируйте QR-код в приложении-аутентификаторе:
          </p>
          
          {isLoading && (
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="text-gray-300 mt-2">Генерируем QR-код...</p>
            </div>
          )}
          
          {qrCode && (
            <div className="bg-white p-4 rounded-lg text-center">
              <Image src={qrCode} alt="QR Code" width={256} height={256} className="mx-auto" />
            </div>
          )}
          
          {secret && (
            <div>
              <p className="text-sm text-gray-400 mb-2">
                Или введите секретный ключ вручную:
              </p>
              <code className="bg-gray-700 p-2 rounded text-green-400 text-sm break-all block">
                {secret}
              </code>
            </div>
          )}

          <div className="bg-blue-900/50 p-4 rounded border border-blue-500">
            <h3 className="font-medium text-blue-200 mb-2">
              Рекомендуемые приложения:
            </h3>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Google Authenticator</li>
              <li>• Authy</li>
              <li>• Microsoft Authenticator</li>
              <li>• 1Password</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-900/50 p-3 rounded border border-red-500">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <Button
            onClick={() => setStep('verify')}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!qrCode || isLoading}
          >
            Я настроил приложение
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">
        Подтверждение настройки 2FA
      </h2>
      
      <div className="space-y-4">
        <p className="text-gray-300">
          Введите 6-значный код из приложения-аутентификатора:
        </p>
        
        <Input
          type="text"
          placeholder="123456"
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="text-center text-xl tracking-widest bg-gray-700 border-gray-600 text-white"
          maxLength={6}
        />

        {error && (
          <div className="bg-red-900/50 p-3 rounded border border-red-500">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            onClick={() => setStep('generate')}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Назад
          </Button>
          <Button
            onClick={verifyAndActivate}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={isLoading || verifyCode.length !== 6}
          >
            {isLoading ? 'Проверка...' : 'Активировать 2FA'}
          </Button>
        </div>
      </div>
    </div>
  );
} 