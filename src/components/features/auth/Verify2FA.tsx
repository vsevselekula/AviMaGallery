'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { logger } from '@/lib/logger';

interface Verify2FAProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function Verify2FA({ onSuccess, onCancel }: Verify2FAProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Получаем активные MFA факторы
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const activeFactor = factors?.totp?.find(
        (factor) => factor.status === 'verified'
      );

      if (!activeFactor) {
        throw new Error('2FA не настроена');
      }

      // Создаем challenge для проверки
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId: activeFactor.id,
        });

      if (challengeError) throw challengeError;

      // Проверяем код
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: activeFactor.id,
        challengeId: challenge.id,
        code: code,
      });

      if (verifyError) throw verifyError;

      logger.auth.info('2FA verification successful');
      onSuccess();
    } catch (err) {
      logger.auth.error('2FA verification error:', err);
      setError(err instanceof Error ? err.message : 'Неверный код');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerify();
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">
        Двухфакторная аутентификация
      </h2>

      <div className="space-y-4">
        <p className="text-gray-300">
          Введите код из приложения-аутентификатора:
        </p>

        <Input
          type="text"
          placeholder="123456"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
          }
          onKeyPress={handleKeyPress}
          className="text-center text-xl tracking-widest bg-gray-700 border-gray-600 text-white"
          maxLength={6}
          autoFocus
        />

        {error && (
          <div className="bg-red-900/50 p-3 rounded border border-red-500">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">Не получаете код?</p>
          <button
            className="text-sm text-blue-400 hover:text-blue-300"
            onClick={() => {
              setError(null);
              setCode('');
            }}
          >
            Попробовать еще раз
          </button>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            onClick={handleVerify}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? 'Проверка...' : 'Войти'}
          </Button>
        </div>
      </div>
    </div>
  );
}
