-- Тестовые данные для системы обратной связи
-- Замените user_id на реальные ID пользователей из вашей базы

-- Получаем ID первого пользователя для тестов
-- SELECT id FROM auth.users LIMIT 1;

-- Вставляем тестовые заявки (замените 'your-user-id-here' на реальный ID)
INSERT INTO public.feedback (
  user_id,
  title,
  description,
  category,
  status,
  current_page,
  user_agent,
  admin_notes
) VALUES 
(
  'your-user-id-here', -- Замените на реальный user_id
  'Добавить темную тему',
  'Было бы здорово иметь возможность переключаться между светлой и темной темой интерфейса. Это поможет снизить нагрузку на глаза при работе в темное время суток.',
  'feature',
  'new',
  '/dashboard/campaigns',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  NULL
),
(
  'your-user-id-here', -- Замените на реальный user_id
  'Ошибка при загрузке кампаний',
  'Иногда при обновлении страницы кампании не загружаются. Приходится перезагружать страницу несколько раз.',
  'bug',
  'in_progress',
  '/dashboard/campaigns',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Проблема воспроизведена, работаем над исправлением'
),
(
  'your-user-id-here', -- Замените на реальный user_id
  'Улучшить фильтры в аналитике',
  'Добавить возможность фильтровать данные по датам и сохранять настройки фильтров между сессиями.',
  'improvement',
  'completed',
  '/dashboard/analytics',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Фильтры по датам добавлены в версии 1.2.0'
),
(
  'your-user-id-here', -- Замените на реальный user_id
  'Экспорт данных в Excel',
  'Нужна возможность экспортировать аналитические данные в формате Excel для дальнейшей обработки.',
  'feature',
  'new',
  '/dashboard/analytics',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  NULL
);

-- Проверяем созданные записи
SELECT 
  f.*,
  u.email as user_email
FROM public.feedback f
JOIN auth.users u ON f.user_id = u.id
ORDER BY f.created_at DESC; 