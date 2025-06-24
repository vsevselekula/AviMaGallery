# Технический контекст

## Технологии

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase
- Chart.js / react-chartjs-2
- dotenv

## Разработка

- Node.js
- npm
- TypeScript
- ESLint
- Prettier

## База данных

- Supabase (PostgreSQL)
- Таблицы:
  - users
  - campaigns
  - verticals
  - user_roles

## Переменные окружения

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Структура данных

### Вертикали (verticals)

- id: TEXT (например, "vertical-1")
- name: TEXT
- description: TEXT
- main_image: TEXT
- team_members: JSONB

### Кампании (campaigns)

- id: UUID
- campaign_name: TEXT
- flight_period: JSONB
- vertical: TEXT
- type: TEXT
- status: TEXT
- image_url: TEXT
- image_file: BYTEA
- video_url: TEXT
- video_type: TEXT (enum: 'google_drive', 'yandex_disk')

### Пользователи (users)

- id: UUID
- email: TEXT
- role: TEXT
- first_name: TEXT
- last_name: TEXT
- avito_login: TEXT
- photo_url: TEXT
- vertical: TEXT
- position: TEXT

## Скрипты

- `scripts/importVerticals.ts`: Импорт данных вертикалей в Supabase
  - Использует dotenv для загрузки переменных окружения
  - Читает данные из `src/data/verticals.json`
  - Импортирует данные в таблицу `verticals`

## Зависимости

- @supabase/supabase-js
- @supabase/auth-helpers-nextjs
- chart.js
- react-chartjs-2
- dotenv
- typescript
- ts-node

## Ограничения

- Необходимо обеспечить правильную обработку ошибок при загрузке данных из Supabase
- Требуется реализовать механизм обновления данных при их изменении
- Нужно добавить валидацию данных при импорте
- Ошибки линтера из-за отсутствующих типов
- Проблемы с отображением видео из Google Диска

## Настройка окружения

1. Установить зависимости: `npm install`
2. Создать файл `.env.local` с необходимыми переменными окружения
3. Запустить скрипт импорта вертикалей: `npx ts-node scripts/importVerticals.ts`
4. Запустить приложение: `npm run dev`

## Стек технологий

### Frontend

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Primarily React hooks (`useState`, `useEffect`, `useContext`) and custom hooks for data fetching (`useCampaigns`, `useFeedback`).
- **Testing**: Jest, likely with React Testing Library for component tests.
- React 18
- TypeScript
- Next.js 14 (App Router). **Настроена поддержка внешних доменов изображений (images.unsplash.com) в next.config.js с использованием `images.remotePatterns`.**
- Tailwind CSS
- Framer Motion (для анимаций)
- React Query (для управления состоянием)
- Zod (для валидации форм)
- Chart.js (для графиков). **Используется `maintainAspectRatio: false` для гистограмм, чтобы они занимали всю доступную ширину.**
- react-chartjs-2 (компоненты React для Chart.js)
- Types/Interfaces: Добавлены интерфейсы `UserProfile`, `Vertical` и `TeamMember` для структурирования данных профиля, вертикалей и членов команды.
- Получение роли пользователя: Роль пользователя теперь извлекается из таблицы `user_roles` в Supabase, а не устанавливается по умолчанию.
- **Адаптивный сайдбар: На мобильных устройствах реализовано бургер-меню, на десктопах сайдбар всегда раскрыт.**

### Backend

- **Platform**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime for live updates (e.g., reactions).

### Инструменты разработки

- ESLint
- Prettier
- Husky
- Jest + React Testing Library

## Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Страницы дашборда
│   │   ├── profile/      # Страница профиля пользователя
│   │   ├── verticals/    # Страницы вертикалей. **Теперь отображают только кампании, относящиеся к данной вертикали, и скрывают фильтр по вертикали.**
│   │   │   └── [verticalName]/ # Динамическая страница для конкретной вертикали
│   │   ├── video/        # Новая страница с видеоплеером и случайным стоп-кадром
│   │   └── ...
├── components/            # React компоненты
│   ├── ui/               # Базовые UI компоненты
│   ├── layout/           # Компоненты макета
│   └── features/         # Функциональные компоненты
├── lib/                  # Утилиты и хелперы
├── hooks/               # React хуки
├── types/               # TypeScript типы
├── styles/              # Глобальные стили
├── data/                # Мок-данные (например, campaigns.json, verticals.json - **vertiсаls.json теперь содержит актуальные данные**)
└── config/              # Конфигурация
```

## Зависимости

```json
{
  "dependencies": {
    "@supabase/auth-helpers-nextjs": "latest",
    "@supabase/supabase-js": "latest",
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "tailwindcss": "latest",
    "framer-motion": "latest",
    "@tanstack/react-query": "latest",
    "zod": "latest",
    "chart.js": "latest",
    "react-chartjs-2": "latest"
  }
}
```

## Конфигурация Supabase

- Регион: eu-central-1
- Аутентификация: Email (без подтверждения)
- База данных: PostgreSQL (включая таблицу для профилей пользователей)
- Storage: для медиафайлов (включая фото профиля)
- Edge Functions

## Политики RLS

### Таблица campaigns

- SELECT: `true` (публичный доступ)
- INSERT: `auth.role() = 'authenticated'`
- UPDATE: `auth.role() = 'authenticated'`
- DELETE: `auth.role() = 'authenticated'`

### Бакет campaign-images

- SELECT: `true` (публичный доступ)
- INSERT: `auth.role() = 'authenticated'`
- UPDATE: `auth.role() = 'authenticated'`
- DELETE: `auth.role() = 'authenticated'`

## Development & Tooling

- **Package Manager**: npm
- **Environment Variables**: Managed via `.env.local` for Supabase keys and other secrets.
- **Code Quality**: TypeScript for type safety.
