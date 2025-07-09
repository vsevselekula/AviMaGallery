# 📧 Настройка SMTP для корпоративной почты Avito

## Проблема

Пользователи не получают email от Supabase из-за ограничений встроенного SMTP провайдера.

## Решение: Настройка Resend SMTP

### 1. Регистрация в Resend

1. Перейти на [resend.com](https://resend.com)
2. Создать аккаунт
3. Подтвердить домен @avito.ru (требуется доступ к DNS)

### 2. Получение SMTP креденшиалов

```
SMTP Host: smtp.resend.com
SMTP Port: 587 (TLS) или 465 (SSL)
Username: resend
Password: [API ключ из панели Resend]
```

### 3. Настройка в Supabase

1. Открыть Supabase Dashboard
2. Перейти в Authentication → Settings
3. Найти раздел "SMTP Settings"
4. Заполнить поля:
   - **SMTP Host**: smtp.resend.com
   - **SMTP Port**: 587
   - **SMTP User**: resend
   - **SMTP Pass**: [ваш API ключ]
   - **Sender email**: noreply@avito.ru
   - **Sender name**: Avito Campaign Manager

### 4. Настройка DNS записей (для IT-отдела)

Добавить следующие DNS записи для домена avito.ru:

```
TXT record:
Name: _resend
Value: [значение из панели Resend]

MX record:
Name: send
Value: send.resend.com
Priority: 10
```

### 5. Тестирование

После настройки запустить:

```bash
node test-email-sending.js
```

## Альтернативные провайдеры

### SendGrid

- Более сложная настройка
- Требует верификации домена
- Хорошая доставляемость

### Amazon SES

- Дешевый для больших объемов
- Требует настройки AWS
- Сложная первоначальная настройка

## Временное решение

До настройки SMTP попросить пользователей:

1. Проверить папку "Спам"
2. Добавить noreply@supabase.io в белый список
3. Обратиться к IT для разблокировки домена supabase.io

## Мониторинг

После настройки следить за:

- Auth Logs в Supabase
- Delivery статистикой в панели SMTP провайдера
- Отзывами пользователей о получении писем
