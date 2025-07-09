'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Setup2FA } from './auth/Setup2FA';
import { logger } from '@/lib/logger';

export function Profile2FASettings() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisabling, setIsDisabling] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const hasActiveFactor = data?.totp?.some(factor => factor.status === 'verified');
      setMfaEnabled(!!hasActiveFactor);
    } catch (error) {
      logger.auth.error('Error checking MFA status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Вы уверены, что хотите отключить двухфакторную аутентификацию?\n\nЭто снизит безопасность вашего аккаунта.')) {
      return;
    }

    // Проверяем текущий AAL уровень
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    if (!aal || aal.currentLevel !== 'aal2') {
      // Нужна верификация 2FA для получения AAL2
      setShowVerification(true);
      return;
    }

    // Если уже AAL2, можем отключать
    await performDisable2FA();
  };

  const handleVerificationSubmit = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError('Введите 6-значный код');
      return;
    }

    setIsDisabling(true);
    setVerificationError('');

    try {
      // Получаем активный фактор
      const { data } = await supabase.auth.mfa.listFactors();
      const activeFactor = data?.totp?.find(factor => factor.status === 'verified');
      
      if (!activeFactor) {
        throw new Error('Активный 2FA фактор не найден');
      }

      // Создаем challenge
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: activeFactor.id,
      });

      if (challengeError) throw challengeError;

      // Верифицируем код
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: activeFactor.id,
        challengeId: challenge.id,
        code: verificationCode,
      });

      if (verifyError) {
        setVerificationError('Неверный код. Попробуйте еще раз.');
        setVerificationCode('');
        return;
      }

      // После успешной верификации отключаем 2FA
      setShowVerification(false);
      await performDisable2FA();

    } catch (error) {
      logger.auth.error('Error verifying 2FA:', error);
      setVerificationError('Ошибка верификации. Попробуйте еще раз.');
    } finally {
      setIsDisabling(false);
    }
  };

  const performDisable2FA = async () => {
    setIsDisabling(true);

    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const activeFactor = data?.totp?.find(factor => factor.status === 'verified');
      
      if (activeFactor) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: activeFactor.id });
        
        if (error) throw error;
        
        setMfaEnabled(false);
        logger.auth.info('2FA disabled successfully');
        
        // Обновляем сессию после отключения
        await supabase.auth.refreshSession();
      }
    } catch (error) {
      logger.auth.error('Error disabling 2FA:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert(`Ошибка отключения 2FA: ${errorMessage}`);
    } finally {
      setIsDisabling(false);
    }
  };

  const cancelVerification = () => {
    setShowVerification(false);
    setVerificationCode('');
    setVerificationError('');
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (showSetup) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">
            Настройка двухфакторной аутентификации
          </h3>
          <Button
            onClick={() => setShowSetup(false)}
            variant="outline"
            className="text-sm"
          >
            Отмена
          </Button>
        </div>
        
        <Setup2FA
          onSetupComplete={() => {
            setShowSetup(false);
            setMfaEnabled(true);
          }}
        />
      </div>
    );
  }

  if (showVerification) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">
          Подтверждение отключения 2FA
        </h3>
        
        <div className="space-y-4">
          <div className="bg-yellow-900/50 p-4 rounded border border-yellow-500">
            <p className="text-yellow-200 text-sm">
              🔒 Для отключения двухфакторной аутентификации требуется подтверждение. 
              Введите код из вашего приложения-аутентификатора:
            </p>
          </div>

          <div className="space-y-3">
            <Input
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
            />

            {verificationError && (
              <div className="bg-red-900/50 p-3 rounded border border-red-500">
                <p className="text-red-200 text-sm">{verificationError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleVerificationSubmit}
                disabled={isDisabling || verificationCode.length !== 6}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isDisabling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Отключение...
                  </>
                ) : (
                  'Подтвердить и отключить 2FA'
                )}
              </Button>
              
              <Button
                onClick={cancelVerification}
                variant="outline"
                disabled={isDisabling}
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-medium text-white mb-4">
        Двухфакторная аутентификация (2FA)
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${mfaEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <p className="text-white font-medium">
                {mfaEnabled ? '2FA включена' : '2FA отключена'}
              </p>
              <p className="text-sm text-gray-400">
                {mfaEnabled 
                  ? 'Ваш аккаунт защищен двухфакторной аутентификацией'
                  : 'Включите 2FA для дополнительной безопасности'
                }
              </p>
            </div>
          </div>
          
          {mfaEnabled && (
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>

        {!mfaEnabled ? (
          <div className="space-y-3">
            <div className="bg-blue-900/50 p-4 rounded border border-blue-500">
              <h4 className="font-medium text-blue-200 mb-2">
                Преимущества 2FA:
              </h4>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• Дополнительная защита от взлома</li>
                <li>• Безопасность даже при компрометации пароля</li>
                <li>• Соответствие корпоративным стандартам безопасности</li>
              </ul>
            </div>
            
            <Button
              onClick={() => setShowSetup(true)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Настроить 2FA
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-900/50 p-4 rounded border border-green-500">
              <p className="text-sm text-green-200">
                ✅ Двухфакторная аутентификация активна. Ваш аккаунт защищен!
              </p>
            </div>
            
            <Button
              onClick={handleDisable2FA}
              variant="outline"
              className="w-full border-red-500 text-red-400 hover:bg-red-900/50"
              disabled={isDisabling}
            >
              {isDisabling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Отключение...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Отключить 2FA
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 