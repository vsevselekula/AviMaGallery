# 🔐 Настройка OAuth/SSO для Avito Campaign Manager

## Шаг 1: Определите тип провайдера

Спросите у IT-отдела какой OAuth провайдер используется:

### Google Workspace
```env
# Добавить в .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Microsoft Azure AD / Office 365
```env
# Добавить в .env.local
NEXT_PUBLIC_AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id
```

### Okta
```env
# Добавить в .env.local
NEXT_PUBLIC_OKTA_DOMAIN=your-domain.okta.com
OKTA_CLIENT_ID=your-client-id
OKTA_CLIENT_SECRET=your-client-secret
```

### Собственный OAuth провайдер
```env
# Добавить в .env.local
OAUTH_PROVIDER_URL=https://your-oauth-server.avito.ru
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
```

## Шаг 2: Настройка в Supabase Dashboard

1. Откройте Supabase Dashboard
2. Перейдите в **Authentication → Providers**
3. Включите нужный провайдер
4. Добавьте Client ID и Client Secret
5. Настройте Redirect URLs:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```

## Шаг 3: Обновление кода

### Добавить OAuth кнопку в LoginForm:

```tsx
// В src/components/features/auth/LoginForm.tsx
const handleOAuthLogin = async (provider: 'google' | 'azure' | 'okta') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) {
    console.error('OAuth error:', error);
  }
};

// Добавить кнопку
<Button 
  onClick={() => handleOAuthLogin('google')}
  className="w-full"
>
  Войти через корпоративный аккаунт
</Button>
```

### Обновить middleware для OAuth:

```tsx
// В src/middleware.ts - добавить проверку OAuth токенов
```

## Шаг 4: Тестирование

1. **Development**: тест на localhost:3000
2. **Production**: тест на рабочем домене
3. **Роли**: проверить что роли пользователей сохраняются

## Информация для IT-отдела

Для регистрации приложения в OAuth провайдере нужны:

### Redirect URLs:
```
Development: http://localhost:3000/auth/callback
Production: https://your-domain.com/auth/callback
```

### Требуемые scopes:
```
- email (для получения email пользователя)
- profile (для получения имени)
- openid (для OIDC)
```

### Домены:
```
- localhost:3000 (для разработки)
- your-production-domain.com
``` 