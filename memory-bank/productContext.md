# Product Context

## Problem Space

Before this tool, campaign information was likely decentralized across various documents, spreadsheets, and communication channels. This leads to several problems:

- Lack of a single source of truth.
- Difficulty in tracking the status and performance of multiple campaigns simultaneously.
- Inefficient collaboration and feedback loops between team members.
- No unified calendar view for all marketing activities.

## User & Goal

The primary users are members of the Avito marketing team, including managers, specialists, and designers.

The main goal is to provide them with a clear, efficient, and centralized system to:

- **Plan** new campaigns.
- **Track** the status of active campaigns (Planned, Active, Completed).
- **Review** campaign details, including objectives, target audience, and creative materials (images, videos).
- **Collaborate** through a system of reactions and feedback.
- **Visualize** all activities on a shared calendar.

## Контекст продукта

**Почему этот проект существует (Проблемы, которые он решает):**

- Сложность отслеживания и управления многочисленными рекламными кампаниями.
- Отсутствие централизованного места для быстрого обзора статуса и деталей кампаний.
- Необходимость в наглядной аналитике для понимания распределения кампаний по различным параметрам (вертикали, типы, время запуска).
- Отсутствие адаптивного и удобного интерфейса для доступа к информации о кампаниях на разных устройствах.
- Отсутствие возможности персонализации пользовательского опыта и управления личной информацией.

**Как он должен работать (Функциональность):**

- Пользователи должны иметь возможность быстро просматривать текущие активные кампании на домашней странице.
- Должен быть доступен полный список всех кампаний с возможностью фильтрации и поиска.
- При клике на кампанию должна открываться модальное окно с подробной информацией.
- **Реализована возможность редактирования кампаний для супер администраторов, с сохранением изменений в Supabase и немедленным отображением в UI.**
- Календарь должен предоставлять визуальное представление кампаний по годам и месяцам.
- Страница аналитики должна представлять ключевые метрики и распределения кампаний в виде наглядных графиков.
- Сайдбар должен обеспечивать удобную навигацию и иметь возможность сворачиваться для экономии места, а также предоставлять раскрывающийся список вертикалей для быстрого перехода на их страницы. **Список вертикалей теперь динамически подгружается из актуальных данных, исключая несуществующие элементы.**
- Пользователи должны иметь возможность просматривать детальную информацию о каждой вертикали, включая описание, состав команды и список связанных кампаний. **На этих страницах фильтр кампаний по вертикали скрыт, так как отображаются только релевантные кампании.** **Теперь на этих страницах корректно отображаются все рекламные кампании, относящиеся к данной вертикали.** **Улучшено отображение изображений на страницах вертикалей.**
- Аутентификация должна быть простой и надежной для обеспечения безопасности данных.
- Пользователи должны иметь возможность просматривать и редактировать свою личную информацию (имя, фамилия, должность, вертикаль, фото) и видеть свой логин Авито и роль, переходя на страницу профиля через клик по своим данным в сайдбаре.
- Должна быть доступна отдельная страница для просмотра видеоматериалов с возможностью отображения случайных стоп-кадров.
- **Все страницы, отображающие кампании (главная, список кампаний, календарь), теперь загружают данные напрямую из Supabase, обеспечивая актуальность информации.**

**Цели пользовательского опыта:**

- **Интуитивность:** Приложение должно быть простым в использовании и понимании, даже для новых пользователей.
- **Эффективность:** Пользователи должны быстро находить нужную информацию и выполнять задачи.
- **Наглядность:** Данные, особенно аналитика, должны быть представлены в максимально понятном и визуально привлекательном виде. **Улучшена визуальная составляющая страниц вертикалей благодаря корректной загрузке изображений.** Дополнительно, страница "Видео" предоставляет возможность просмотра обучающих или презентационных материалов.
- **Доступность:** Приложение должно быть полностью адаптивным и хорошо работать на устройствах с разными размерами экранов (десктопы, планшеты, мобильные).
- **Согласованность:** UI/UX должен быть единообразным по всему приложению.
- **Персонализация:** Пользователи должны чувствовать, что приложение адаптировано под них, имея возможность управлять своим профилем.
- **Актуальность данных:** Пользователи видят самые свежие данные кампаний, сразу после сохранения.
