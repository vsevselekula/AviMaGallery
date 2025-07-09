# System & Architectural Patterns

## Core Architecture

- **Framework**: The application is built with **Next.js** using the **App Router** paradigm. This means the file system in `src/app` dictates the application's routes.
- **Backend-as-a-Service (BaaS)**: **Supabase** is the cornerstone of the backend. It provides:
  - **Database**: A PostgreSQL database to store structured data like campaigns, users, and feedback.
  - **Authentication**: Manages user sign-up, login, and session management.
  - **Storage**: Used for handling file uploads, such as campaign banners and attachments in feedback.
- **Client-Server Interaction**: The frontend interacts with Supabase primarily through the `@supabase/auth-helpers-nextjs` library, using `createClientComponentClient` for client-side data fetching and mutations. API routes in `src/app/api` are used for more complex or sensitive backend logic.

## Key Data Structures

- **Campaign**: The central data entity in the application. It includes fields like `campaign_name`, `campaign_type`, `status`, `flight_period`, `vertical`, creative assets (`image_url`, `video_url`), and relational data.

## Important Patterns

- **Authentication Flow**:
  1.  User registers. The frontend UI enforces an `@avito.ru` email.
  2.  Supabase sends a confirmation email. The link's domain is configured in the Supabase project's **Site URL**.
  3.  The link points to the application's `/auth/callback` page for session exchange.
- **Server-Side Validation**: A PostgreSQL trigger (`ensure_avito_domain_on_signup` on the `auth.users` table) provides robust, backend-level protection, rejecting any registration attempt with a non-`@avito.ru` email. This is the primary security measure against unauthorized domain registrations.
- **Modal-based Interface**: Most interactions, like viewing campaign details or editing a campaign, are handled within modal dialogs, keeping the user within the main dashboard context.

## Паттерны проектирования

1. Компонентный подход

   - Переиспользуемые компоненты
   - Композиция компонентов
   - Разделение ответственности

2. Управление состоянием

   - React Hooks
   - Supabase Realtime для обновлений в реальном времени
   - Локальное состояние для UI

3. Работа с данными

   - Загрузка данных из Supabase
   - Кэширование данных
   - Обработка ошибок
   - Валидация данных

4. Аутентификация и авторизация

   - Supabase Auth
   - Middleware для защиты маршрутов
   - Ролевая модель доступа

5. Стилизация
   - Tailwind CSS
   - Кастомные компоненты
   - Адаптивный дизайн

## Компонентные отношения

1. Страницы

   - `/dashboard`: Главная страница
   - `/dashboard/campaigns`: Список кампаний
   - `/dashboard/calendar`: Календарь кампаний
   - `/dashboard/analytics`: Аналитика
   - `/dashboard/video`: Видео
   - `/dashboard/profile`: Профиль
   - `/dashboard/verticals/[verticalName]`: Страница вертикали

2. Компоненты

   - `Sidebar`: Навигация
   - `CampaignList`: Список кампаний
   - `CampaignModal`: Модальное окно кампании
   - `CampaignCalendar`: Календарь кампаний
   - `AnalyticsCharts`: Графики аналитики
   - `VerticalList`: Список вертикалей
   - `ImageUpload`: Компонент для загрузки изображений
   - `VideoPlayer`: Компонент для отображения видео

3. Утилиты
   - `getVerticalColorClass`: Получение цвета вертикали
   - `formatDate`: Форматирование даты
   - `importVerticals`: Импорт данных вертикалей

## Технические решения

1. Использование Supabase

   - Хранение данных
   - Аутентификация
   - Realtime обновления

2. Управление переменными окружения

   - dotenv для скриптов
   - Next.js для приложения

3. Импорт данных

   - Скрипты на TypeScript
   - Валидация данных
   - Обработка ошибок

4. Оптимизация производительности
   - Кэширование данных
   - Ленивая загрузка компонентов
   - Оптимизация изображений

## Известные проблемы

1. **Проблемы с отображением видео из Google Диска и Яндекс.Диска из-за Content Security Policy (CSP) их серверов.** Прямое встраивание через `iframe` блокируется. Рекомендуется использовать прямые ссылки на видеофайлы или альтернативные видеохостинги, разрешающие встраивание.
2. Необходимо обеспечить правильную обработку ошибок при загрузке данных из Supabase
3. Требуется реализовать механизм обновления данных при их изменении
4. Нужно добавить валидацию данных при импорте
5. Ошибки линтера из-за отсутствующих типов (если еще остались)

## Следующие шаги

1. Обновить компоненты приложения для загрузки данных вертикалей из Supabase
2. Добавить обработку ошибок при загрузке данных
3. Реализовать кэширование данных для оптимизации производительности
4. Добавить возможность редактирования данных вертикалей через интерфейс

## Паттерны компонентов

### Атомарный дизайн

1. Atoms (атомы)

   - Button
   - Input
   - Card
   - Typography

2. Molecules (молекулы)

   - SearchBar
   - FilterGroup
   - CampaignCard
   - HeroBanner

3. Organisms (организмы)

   - CampaignGallery
   - CampaignDetails
   - AdminPanel
   - Timeline
   - UserProfileForm (для страницы профиля)
   - VerticalDetailSection (для отображения деталей вертикали). **Теперь корректно отображает рекламные кампании, относящиеся к текущей вертикали.**

4. Templates (шаблоны)

   - MainLayout
   - AuthLayout
   - AdminLayout

5. Pages (страницы)
   - Home
   - Campaign
   - Analytics
   - Calendar
   - Profile
   - VerticalDetail
   - Video (новая страница с видеоплеером и случайным стоп-кадром)

## Паттерны данных

### Supabase структура

```sql
-- Роли пользователей
user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('viewer', 'editor', 'super_admin')),
  created_at timestamp with time zone default now()
)

-- Кампании
campaigns (
  id uuid primary key,
  title text,
  description text,
  level text check (level in ('T1', 'T2', 'T3', 'special')),
  start_date date,
  end_date date,
  budget decimal,
  vertical_id uuid references verticals(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
)

-- Вертикали
verticals (
  id uuid primary key,
  name text unique,
  description text,
  main_image text
)

-- Члены команды вертикали
team_members (
  id uuid primary key,
  vertical_id uuid references verticals(id),
  name text,
  role text,
  initials text
)

-- Материалы кампаний
campaign_materials (
  id uuid primary key,
  campaign_id uuid references campaigns(id),
  type text check (type in ('image', 'video', 'document')),
  url text,
  created_at timestamp with time zone default now()
)
```

**Важный паттерн: Все операции CRUD для кампаний (чтение, обновление, удаление) используют уникальный `id` (UUID) кампании для идентификации, а не `campaign_name` или другие поля.**

## Паттерны аутентификации

1. Middleware для защиты маршрутов
2. Ролевая модель доступа
3. Проверка домена @avito.ru
4. JWT токены через Supabase

## Паттерны UI/UX

1. Glassmorphism для hero-баннера
2. Netflix-подобный горизонтальный скролл
3. Адаптивный дизайн
4. Анимации через Framer Motion

## Паттерны тестирования

1. Unit тесты для компонентов
2. Интеграционные тесты для форм
3. E2E тесты для критических путей
4. Моки для Supabase
