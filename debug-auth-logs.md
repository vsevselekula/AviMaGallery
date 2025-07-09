# 🔍 Отладка проблем с аутентификацией

## Проверка Auth Logs в Supabase

1. **Откройте Supabase Dashboard**

   - Перейдите к вашему проекту
   - Найдите раздел **Authentication** → **Logs**

2. **Фильтрация логов**

   ```
   Уровень: Error
   Временной период: Последние 1-2 часа
   ```

3. **Что искать в логах:**
   - Ошибки SMTP соединения
   - Проблемы с email templates
   - Rate limiting ошибки
   - Неверные redirect URLs

## Типичные ошибки и решения

### Rate Limiting

```
Error: For security purposes, you can only request this after 12 seconds
```

**Решение:** Подождать 12+ секунд между попытками

### SMTP ошибки

```
Error: Failed to send email via SMTP
```

**Решение:** Проверить настройки SMTP провайдера

### Redirect URL ошибки

```
Error: Invalid redirect URL
```

**Решение:** Добавить правильные URLs в Auth Settings

## Проверка настроек

### Site URL

- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

### Redirect URLs

- `http://localhost:3000/auth/callback`
- `https://your-domain.com/auth/callback`

### Email Templates

- Проверить, что templates не содержат ошибок
- Убедиться, что используется правильный Site URL в ссылках
