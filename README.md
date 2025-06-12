# Avito Creative Gallery

Внутренняя галерея в стиле Netflix для обмена рекламными кампаниями, инсайтами и аналитикой между вертикалями Avito.

## Технологии

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- Framer Motion

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/avito-gallery.git
cd avito-gallery
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env.local` и добавьте переменные окружения:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Запустите проект:
```bash
npm run dev
```

## Тестовые аккаунты

- Super Admin: admin@avito.ru / password123
- Editor: editor@avito.ru / password123
- Viewer: viewer@avito.ru / password123

## Функциональность

- Netflix-подобный интерфейс с горизонтальным скроллом
- Hero-баннер с автопрокруткой
- Поиск и фильтрация кампаний
- Детальные страницы кампаний
- Календарь кампаний
- Админ-панель
- Ролевая модель доступа

## Структура проекта

```
src/
├── app/                    # Next.js App Router
├── components/            # React компоненты
│   ├── ui/               # Базовые UI компоненты
│   ├── layout/           # Компоненты макета
│   └── features/         # Функциональные компоненты
├── lib/                  # Утилиты и хелперы
├── hooks/               # React хуки
├── types/               # TypeScript типы
├── styles/              # Глобальные стили
└── config/              # Конфигурация
```

## Лицензия

MIT 