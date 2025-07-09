# 🚀 Интеграция Avito Hydra OAuth для Vercel

## 🎯 Архитектура: только Production на Vercel

### Шаг 1: Создание задачи в SEC

```
Проект: SEC
Компонент: OAuth&Hydra
Имя сервиса: campaign-manager
Callback URLs:
  - https://your-vercel-domain.vercel.app/oauth2/callback
Scopes: profile, email, offline
```

### Шаг 2: Настройка Vercel Environment Variables

В Vercel Dashboard → Project → Settings → Environment Variables:

```env
# Production Hydra
NEXT_PUBLIC_HYDRA_URL=https://oauth2.avito.ru
HYDRA_CLIENT_ID=campaign-manager
HYDRA_CLIENT_SECRET=получить_из_SEC_задачи
NEXT_PUBLIC_OAUTH_REDIRECT_URI=https://your-vercel-domain.vercel.app/oauth2/callback

# Для локальной разработки (staging Hydra)
NEXT_PUBLIC_HYDRA_URL_LOCAL=https://oauth2-test.avito.ru
HYDRA_CLIENT_SECRET_LOCAL=123456
```

### Шаг 3: Упрощенный OAuth callback

`src/app/oauth2/callback/page.tsx`:

```tsx
'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        logger.auth.error('OAuth error:', error);
        router.push('/auth/login?error=oauth_error');
        return;
      }

      if (!code) {
        logger.auth.error('No authorization code received');
        router.push('/auth/login?error=no_code');
        return;
      }

      try {
        // Обмениваем код на JWT токен
        const response = await fetch('/api/auth/oauth/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error('Token exchange failed');
        }

        const { user } = await response.json();
        
        logger.auth.info('OAuth login successful', { email: user.email });
        router.push('/dashboard');
      } catch (err) {
        logger.auth.error('OAuth callback error:', err);
        router.push('/auth/login?error=callback_failed');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-white mb-2">Обработка входа...</h1>
        <p className="text-gray-400">
          Завершаем авторизацию через Avito OAuth
        </p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Загрузка...</div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
```

### Шаг 4: API роут для обмена токенов

`src/app/api/auth/oauth/exchange/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Выбираем URL и креденшиалы в зависимости от окружения
const isLocal = process.env.NODE_ENV === 'development';
const hydraUrl = isLocal 
  ? process.env.NEXT_PUBLIC_HYDRA_URL_LOCAL!
  : process.env.NEXT_PUBLIC_HYDRA_URL!;

const clientSecret = isLocal
  ? process.env.HYDRA_CLIENT_SECRET_LOCAL!
  : process.env.HYDRA_CLIENT_SECRET!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    // Обмениваем authorization code на токены
    const tokenResponse = await fetch(`${hydraUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.HYDRA_CLIENT_ID}:${clientSecret}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI!,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      logger.auth.error('Token exchange failed', { error: errorText });
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokens = await tokenResponse.json();
    
    // Декодируем JWT ID токен
    const idTokenPayload = JSON.parse(
      Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
    );

    const email = idTokenPayload.email;
    const userData = {
      email,
      email_confirm: true,
      user_metadata: {
        full_name: `${idTokenPayload.given_name || ''} ${idTokenPayload.family_name || ''}`.trim(),
        given_name: idTokenPayload.given_name,
        family_name: idTokenPayload.family_name,
        employee_type: idTokenPayload.employee_type,
        organization: idTokenPayload.organization,
        office: idTokenPayload.office,
        oauth_provider: 'hydra',
        login: idTokenPayload.sub, // логин из Hydra
      },
    };

    // Пытаемся создать пользователя или получить существующего
    let user;
    try {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser(userData);
      if (createError && !createError.message.includes('already registered')) {
        throw createError;
      }
      user = newUser?.user;
    } catch (error) {
      // Если пользователь уже существует, получаем его
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      user = existingUsers?.users?.find(u => u.email === email);
    }

    if (!user) {
      throw new Error('Failed to create or find user');
    }

    // Обновляем метаданные пользователя
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { user_metadata: userData.user_metadata }
    );

    if (updateError) {
      logger.auth.warn('Failed to update user metadata', updateError);
    }

    // Создаем сессию для пользователя
    const { data: sessionData, error: sessionError } = 
      await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });

    if (sessionError) {
      throw sessionError;
    }

    logger.auth.info('OAuth user authenticated successfully', {
      email,
      login: idTokenPayload.sub,
      office: idTokenPayload.office,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        ...userData.user_metadata,
      },
      session: sessionData,
    });

  } catch (error: any) {
    logger.auth.error('OAuth exchange error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', details: error.message },
      { status: 400 }
    );
  }
}
```

### Шаг 5: Обновленная LoginForm

Добавить в `src/components/features/auth/LoginForm.tsx`:

```tsx
// В начале компонента добавить функцию
const handleAvitaOAuthLogin = () => {
  const isLocal = process.env.NODE_ENV === 'development';
  const hydraUrl = isLocal 
    ? process.env.NEXT_PUBLIC_HYDRA_URL_LOCAL 
    : process.env.NEXT_PUBLIC_HYDRA_URL;

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_HYDRA_CLIENT_ID || 'campaign-manager',
    response_type: 'code',
    scope: 'openid profile email offline',
    redirect_uri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI!,
    state: crypto.randomUUID(),
  });

  window.location.href = `${hydraUrl}/oauth2/auth?${params.toString()}`;
};

// Добавить кнопку перед обычной формой логина
<div className="mb-6">
  <Button
    onClick={handleAvitaOAuthLogin}
    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
    <span>Войти через Avito OAuth</span>
  </Button>
  
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-600" />
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-gray-800 text-gray-400">или войти с паролем</span>
    </div>
  </div>
</div>
```

## 🧪 Тестирование

### Локально (с staging Hydra):
```bash
# В .env.local
NEXT_PUBLIC_HYDRA_URL_LOCAL=https://oauth2-test.avito.ru
HYDRA_CLIENT_SECRET_LOCAL=123456
```

### На Vercel (с production Hydra):
- Переменные настроены в Vercel Dashboard
- Автоматически использует production эндпоинты

## 🚀 Деплой

После создания SEC задачи и получения client_secret:
1. Обновить переменные в Vercel
2. Задеплоить код
3. Тестировать OAuth flow 