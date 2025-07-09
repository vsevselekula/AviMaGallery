# 🔐 Интеграция с Avito Hydra OAuth

## Шаг 1: Создание задачи в SEC

### Параметры для задачи:
```
Проект: SEC
Компонент: OAuth&Hydra
Имя сервиса: campaign-manager
Callback URLs:
  - Development: http://localhost:3000/oauth2/callback
  - Production: https://your-domain.com/oauth2/callback
Scopes: profile, email, offline
```

## Шаг 2: Настройка переменных окружения

```env
# Добавить в .env.local
NEXT_PUBLIC_HYDRA_URL_STAGING=https://oauth2-test.avito.ru
NEXT_PUBLIC_HYDRA_URL_PROD=https://oauth2.avito.ru
HYDRA_CLIENT_ID=campaign-manager
HYDRA_CLIENT_SECRET=получить_из_SEC_задачи
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/oauth2/callback
```

## Шаг 3: Установка OAuth библиотеки

```bash
npm install @supabase/ssr oauth4webapi
```

## Шаг 4: Создание OAuth callback роута

Создать файл: `src/app/oauth2/callback/page.tsx`

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
      const state = searchParams.get('state');
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
        // Обмениваем код на токены
        const tokenResponse = await fetch('/api/auth/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Token exchange failed');
        }

        const { user, session } = await tokenResponse.json();

        // Устанавливаем сессию в Supabase
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        if (sessionError) {
          throw sessionError;
        }

        logger.auth.info('OAuth login successful');
        router.push('/dashboard');
      } catch (err) {
        logger.auth.error('OAuth callback error:', err);
        router.push('/auth/login?error=callback_failed');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Обработка входа...</h1>
        <p className="text-gray-600">
          Завершаем процесс авторизации через Avito OAuth
        </p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
```

## Шаг 5: API роут для обмена токенов

Создать файл: `src/app/api/auth/oauth/token/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const hydraUrl = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_HYDRA_URL_PROD!
  : process.env.NEXT_PUBLIC_HYDRA_URL_STAGING!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    // Обмениваем authorization code на токены
    const tokenResponse = await fetch(`${hydraUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.HYDRA_CLIENT_ID}:${process.env.HYDRA_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI!,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed');
    }

    const tokens = await tokenResponse.json();
    
    // Декодируем JWT токен для получения пользовательских данных
    const idTokenPayload = JSON.parse(
      Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
    );

    // Создаем или обновляем пользователя в Supabase
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: idTokenPayload.email,
      email_confirm: true,
      user_metadata: {
        name: idTokenPayload.name,
        given_name: idTokenPayload.given_name,
        family_name: idTokenPayload.family_name,
        employee_type: idTokenPayload.employee_type,
        organization: idTokenPayload.organization,
        office: idTokenPayload.office,
        oauth_provider: 'hydra',
      },
    });

    if (userError && !userError.message.includes('already registered')) {
      throw userError;
    }

    // Создаем сессию
    const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: idTokenPayload.email,
    });

    if (sessionError) {
      throw sessionError;
    }

    logger.auth.info('OAuth user authenticated', {
      email: idTokenPayload.email,
      name: idTokenPayload.name,
    });

    return NextResponse.json({
      user: user?.user,
      session: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      },
    });

  } catch (error) {
    logger.auth.error('OAuth token exchange error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 400 }
    );
  }
}
```

## Шаг 6: Обновление LoginForm

```tsx
// Добавить в LoginForm.tsx
const handleHydraLogin = async () => {
  const hydraUrl = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_HYDRA_URL_PROD
    : process.env.NEXT_PUBLIC_HYDRA_URL_STAGING;

  const params = new URLSearchParams({
    client_id: process.env.HYDRA_CLIENT_ID!,
    response_type: 'code',
    scope: 'openid profile email offline',
    redirect_uri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI!,
    state: crypto.randomUUID(), // для безопасности
  });

  window.location.href = `${hydraUrl}/oauth2/auth?${params.toString()}`;
};

// Добавить кнопку
<Button
  onClick={handleHydraLogin}
  className="w-full bg-green-600 hover:bg-green-700 text-white"
>
  Войти через Avito OAuth
</Button>
```

## Шаг 7: Тестирование

### На staging:
- URL: https://oauth2-test.avito.ru
- Все пароли: 123Qwerty
- client_secret: 123456

### На production:
- URL: https://oauth2.avito.ru
- Доменные пароли LDAP
- client_secret из SEC задачи

## Полученные данные пользователя

После успешной авторизации вы получите JWT токен с:
- `sub`: логин пользователя
- `email`: email сотрудника
- `given_name`: имя
- `family_name`: фамилия
- `employee_type`: тип трудоустройства
- `organization`: юридическое название организации
- `office`: офис (MSKBEL, SPBMAL и т.д.) 