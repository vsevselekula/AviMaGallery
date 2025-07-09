# 🔐 Настройка 2FA (Two-Factor Authentication) в Supabase

## Шаг 1: Включение MFA в Supabase Dashboard

1. Откройте **Supabase Dashboard**
2. Перейдите в **Authentication** → **Settings**
3. Найдите раздел **"Multi-Factor Authentication (MFA)"**
4. Включите **"Enable MFA"**
5. Выберите методы:
   - ✅ **TOTP (Time-based One-Time Password)** - рекомендуется
   - ⚠️ **SMS MFA** - требует настройки SMS провайдера
   - ⚠️ **Phone Auth** - дополнительная настройка

## Шаг 2: Установка зависимостей

```bash
npm install qrcode-generator
npm install @types/qrcode-generator --save-dev
```

## Шаг 3: Создание UI компонентов для 2FA

### Компонент настройки 2FA

`src/components/features/auth/Setup2FA.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
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

  const generateQRCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });

      if (error) throw error;

      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setStep('verify');
      }
    } catch (err) {
      logger.auth.error('2FA setup error:', err);
      setError(err instanceof Error ? err.message : '2FA setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndActivate = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: data?.id!, // ID фактора из предыдущего шага
        code: verifyCode,
      });

      if (error) throw error;

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

  useEffect(() => {
    generateQRCode();
  }, []);

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
          
          {qrCode && (
            <div className="bg-white p-4 rounded-lg text-center">
              <img src={qrCode} alt="QR Code" className="mx-auto" />
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-400 mb-2">
              Или введите секретный ключ вручную:
            </p>
            <code className="bg-gray-700 p-2 rounded text-green-400 text-sm break-all">
              {secret}
            </code>
          </div>

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

          <Button
            onClick={() => setStep('verify')}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!qrCode}
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
```

### Компонент ввода 2FA кода при логине

`src/components/features/auth/Verify2FA.tsx`:

```tsx
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
      const activeFactor = factors?.totp?.find(factor => factor.status === 'verified');
      
      if (!activeFactor) {
        throw new Error('2FA не настроена');
      }

      // Создаем challenge для проверки
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
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
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="text-center text-xl tracking-widest bg-gray-700 border-gray-600 text-white"
          maxLength={6}
          autoFocus
        />

        {error && (
          <div className="bg-red-900/50 p-3 rounded border border-red-500">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
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
```

## Шаг 4: Обновление LoginForm с поддержкой 2FA

Добавить в `src/components/features/auth/LoginForm.tsx`:

```tsx
import { Verify2FA } from './Verify2FA';

// Добавить состояния
const [showMFA, setShowMFA] = useState(false);
const [mfaRequired, setMfaRequired] = useState(false);

// Обновить handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setIsLoading(true);

  const fullEmail = `${localEmailPart}@avito.ru`;

  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: fullEmail,
      password,
    });

    if (signInError) {
      // Проверяем, требуется ли MFA
      if (signInError.message.includes('MFA')) {
        setMfaRequired(true);
        setShowMFA(true);
        setIsLoading(false);
        return;
      }
      throw signInError;
    }

    logger.auth.info('Sign in successful');
    router.refresh();
    router.push('/dashboard');
  } catch (error) {
    logger.auth.error('Login error', error);
    setError(error instanceof Error ? error.message : 'Произошла ошибка при входе');
  } finally {
    setIsLoading(false);
  }
};

// Добавить условный рендер для MFA
if (showMFA) {
  return (
    <Verify2FA
      onSuccess={() => {
        router.refresh();
        router.push('/dashboard');
      }}
      onCancel={() => {
        setShowMFA(false);
        setMfaRequired(false);
      }}
    />
  );
}

// Остальной код формы...
```

## Шаг 5: Добавление настройки 2FA в профиль

`src/components/features/Profile2FASettings.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Setup2FA } from './auth/Setup2FA';

export function Profile2FASettings() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const hasActiveFactor = data?.totp?.some(factor => factor.status === 'verified');
      setMfaEnabled(!!hasActiveFactor);
    } catch (error) {
      console.error('Error checking MFA status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Вы уверены, что хотите отключить 2FA?')) return;

    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const activeFactor = data?.totp?.find(factor => factor.status === 'verified');
      
      if (activeFactor) {
        await supabase.auth.mfa.unenroll({ factorId: activeFactor.id });
        setMfaEnabled(false);
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
    }
  };

  if (showSetup) {
    return (
      <Setup2FA
        onSetupComplete={() => {
          setShowSetup(false);
          setMfaEnabled(true);
        }}
      />
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-medium text-white mb-4">
        Двухфакторная аутентификация
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white">Статус 2FA</p>
            <p className="text-sm text-gray-400">
              {mfaEnabled ? 'Включена' : 'Отключена'}
            </p>
          </div>
          <div className={`w-3 h-3 rounded-full ${mfaEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>

        {!mfaEnabled ? (
          <Button
            onClick={() => setShowSetup(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Настроить 2FA
          </Button>
        ) : (
          <Button
            onClick={handleDisable2FA}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-900/50"
          >
            Отключить 2FA
          </Button>
        )}
      </div>
    </div>
  );
}
```

## Шаг 6: Политики безопасности (необязательно)

Можно добавить политику, требующую 2FA для определенных ролей:

```sql
-- В Supabase SQL Editor
CREATE OR REPLACE FUNCTION require_mfa_for_admins()
RETURNS TRIGGER AS $$
BEGIN
  -- Проверяем роль пользователя
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ) THEN
    -- Проверяем наличие активного MFA
    IF NOT EXISTS (
      SELECT 1 FROM auth.mfa_factors 
      WHERE user_id = auth.uid() 
      AND status = 'verified'
    ) THEN
      RAISE EXCEPTION 'Администраторы должны использовать 2FA';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Тестирование 2FA

1. **Включите MFA в Supabase Dashboard**
2. **Создайте тестовый аккаунт**
3. **Настройте 2FA через UI**
4. **Проверьте логин с 2FA**
5. **Протестируйте отключение/включение**

## Рекомендации по безопасности

- ✅ Предложите пользователям backup коды
- ✅ Уведомляйте о включении/отключении 2FA по email
- ✅ Требуйте 2FA для admin ролей
- ✅ Добавьте rate limiting для попыток ввода кода 