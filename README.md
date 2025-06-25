# 🎬 Memory Bank - Внутренняя галерея маркетинговых кампаний Avito

> Современная платформа в стиле Netflix для управления, обмена и анализа рекламных кампаний между вертикалями бизнеса Avito.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🚀 Возможности

### 📊 **Управление кампаниями**
- ✅ Создание, редактирование и удаление кампаний
- ✅ Загрузка изображений и медиафайлов
- ✅ Гибкая система тегов и категоризации
- ✅ Управление периодами проведения (flight periods)
- ✅ Связывание с внешними ресурсами

### 🎨 **Современный интерфейс**
- ✅ Netflix-подобный дизайн с горизонтальным скроллом
- ✅ Адаптивная верстка для всех устройств
- ✅ Темная тема с акцентами Avito
- ✅ Плавные анимации и переходы
- ✅ Интуитивная навигация

### 🔍 **Поиск и фильтрация**
- ✅ Полнотекстовый поиск по кампаниям
- ✅ Фильтрация по вертикалям бизнеса
- ✅ Фильтрация по типам кампаний
- ✅ Фильтрация по статусу (активные/завершенные)
- ✅ Сортировка по различным критериям

### 📅 **Календарь и аналитика**
- ✅ Интерактивный календарь кампаний
- ✅ Визуализация по месяцам и годам
- ✅ Цветовое кодирование по вертикалям
- ✅ Аналитические дашборды
- ✅ Экспорт данных

### 👥 **Система ролей и безопасность**
- ✅ Многоуровневая система ролей (viewer, editor, admin, super_admin)
- ✅ Аутентификация через корпоративную почту @avito.ru
- ✅ Row Level Security (RLS) в базе данных
- ✅ Безопасные API endpoints
- ✅ Валидация на уровне базы данных

### 🔄 **Интерактивность**
- ✅ Система реакций на кампании (👍👎❤️💡⚡)
- ✅ Комментарии и обратная связь
- ✅ Real-time обновления
- ✅ Уведомления о новых кампаниях

## 🛠 Технологический стек

### **Frontend**
- **Next.js 14** - React фреймворк с App Router
- **TypeScript** - Типизированный JavaScript
- **Tailwind CSS** - Utility-first CSS фреймворк
- **TanStack Query** - Управление серверным состоянием
- **Framer Motion** - Анимации и переходы
- **React Hook Form** - Управление формами
- **Zustand** - Легковесное управление состоянием

### **Backend & Database**
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Реляционная база данных
- **Row Level Security (RLS)** - Безопасность на уровне строк
- **Real-time subscriptions** - Живые обновления
- **Supabase Storage** - Хранение файлов

### **DevOps & Tools**
- **Vercel** - Deployment и хостинг
- **GitHub Actions** - CI/CD пайплайны
- **ESLint + Prettier** - Линтинг и форматирование
- **Husky** - Git hooks
- **Jest + Testing Library** - Тестирование

### **Мониторинг & Аналитика**
- **Supabase Analytics** - Встроенная аналитика
- **Performance monitoring** - Мониторинг производительности
- **Error tracking** - Отслеживание ошибок

## 🏗 Архитектура

### **Структура проекта**
```
src/
├── app/                     # Next.js App Router
│   ├── auth/               # Страницы аутентификации
│   ├── dashboard/          # Основное приложение
│   │   ├── analytics/      # Аналитика
│   │   ├── calendar/       # Календарь кампаний
│   │   ├── admin/          # Админ-панель
│   │   └── verticals/      # Страницы вертикалей
│   └── api/                # API endpoints
├── components/             # React компоненты
│   ├── ui/                # Базовые UI компоненты
│   ├── layout/            # Компоненты макета
│   ├── features/          # Функциональные компоненты
│   └── providers/         # Context провайдеры
├── lib/                   # Утилиты и конфигурация
│   ├── api/              # API сервисы
│   ├── database.types.ts  # Автогенерированные типы DB
│   ├── queryClient.ts     # TanStack Query конфигурация
│   └── supabase.ts       # Supabase клиент
├── hooks/                 # Кастомные React хуки
├── types/                 # TypeScript определения
├── contexts/              # React контексты
└── styles/               # Глобальные стили
```

### **База данных**
```sql
-- Основные таблицы
campaigns_v2        # Кампании
user_roles         # Роли пользователей  
campaign_reactions # Реакции на кампании
feedback          # Обратная связь
campaign_images   # Хранилище изображений

-- Безопасность
RLS политики      # Row Level Security
Триггеры         # Валидация email домена
Индексы          # Оптимизация запросов
```

## 🚀 Быстрый старт

### **Предварительные требования**
- Node.js 18+ 
- npm или yarn
- Git

### **Установка**

1. **Клонирование репозитория**
```bash
git clone https://github.com/vsevselekula/AviMaGallery.git
cd AviMaGallery
```

2. **Установка зависимостей**
```bash
npm install
```

3. **Настройка окружения**
```bash
cp .env.example .env.local
```

Заполните переменные в `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. **Запуск в development режиме**
```bash
npm run dev
```

5. **Открытие в браузере**
```
http://localhost:3000
```

### **Production сборка**
```bash
npm run build
npm start
```

## 📝 Доступные скрипты

```bash
npm run dev          # Запуск в development режиме
npm run build        # Сборка для production
npm run start        # Запуск production сборки
npm run lint         # Проверка кода ESLint
npm run format       # Форматирование кода Prettier
npm run test         # Запуск тестов
npm run test:watch   # Запуск тестов в watch режиме
npm run type-check   # Проверка типов TypeScript
```

## 🔐 Система ролей

| Роль | Права доступа |
|------|---------------|
| **viewer** | Просмотр кампаний, добавление реакций |
| **editor** | + Создание и редактирование кампаний |
| **admin** | + Управление пользователями своей вертикали |
| **super_admin** | + Полный доступ ко всем функциям |

## 🎨 Дизайн-система

### **Цветовая палитра**
- **Primary**: Avito Green (#00C853)
- **Secondary**: Dark Gray (#1A1A1A)
- **Background**: Deep Black (#0A0A0A)
- **Text**: White (#FFFFFF)
- **Accent**: Blue (#2196F3)

### **Компоненты**
- Адаптивная сетка
- Переиспользуемые UI компоненты
- Консистентная типографика
- Единообразные анимации

## 📊 Производительность

- ⚡ **Core Web Vitals** - Optimized
- 🚀 **Lazy Loading** - Для изображений и компонентов
- 💾 **Smart Caching** - TanStack Query + Supabase
- 📱 **Mobile First** - Адаптивный дизайн
- 🔄 **Real-time Updates** - WebSocket соединения

## 🧪 Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты  
npm run test:e2e

# Покрытие кода
npm run test:coverage
```

## 🚀 Deployment

### **Vercel (рекомендуется)**
1. Подключите GitHub репозиторий к Vercel
2. Настройте переменные окружения
3. Автоматический деплой при push в main

### **Другие платформы**
- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Закоммитьте изменения (`git commit -m 'Add amazing feature'`)
4. Запушьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🔗 Полезные ссылки

- [Документация Next.js](https://nextjs.org/docs)
- [Документация Supabase](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

<div align="center">
  <strong>Сделано с ❤️ командой Avito</strong>
</div>
