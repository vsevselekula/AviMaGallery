-- Тестовые данные для системы реакций
-- Выполнять после создания таблицы campaign_reactions

-- Получаем несколько кампаний для тестирования
WITH test_campaigns AS (
  SELECT id, campaign_name 
  FROM public.campaigns_v2 
  LIMIT 5
),
test_users AS (
  SELECT id 
  FROM auth.users 
  LIMIT 3
)

-- Добавляем тестовые реакции
INSERT INTO public.campaign_reactions (campaign_id, user_id, reaction_type)
SELECT 
  tc.id as campaign_id,
  tu.id as user_id,
  CASE 
    WHEN random() < 0.2 THEN 'like'
    WHEN random() < 0.4 THEN 'love'
    WHEN random() < 0.6 THEN 'fire'
    WHEN random() < 0.8 THEN 'clap'
    WHEN random() < 0.9 THEN 'thinking'
    ELSE 'wow'
  END as reaction_type
FROM test_campaigns tc
CROSS JOIN test_users tu
WHERE random() < 0.7  -- 70% вероятность что пользователь поставит реакцию
ON CONFLICT (campaign_id, user_id) DO NOTHING;

-- Проверяем результат
SELECT 
  c.campaign_name,
  cr.reaction_type,
  COUNT(*) as count
FROM public.campaign_reactions cr
JOIN public.campaigns_v2 c ON c.id = cr.campaign_id
GROUP BY c.campaign_name, cr.reaction_type
ORDER BY c.campaign_name, cr.reaction_type;

-- Показываем общую статистику
SELECT 
  'Всего реакций' as metric,
  COUNT(*) as value
FROM public.campaign_reactions

UNION ALL

SELECT 
  'Кампаний с реакциями' as metric,
  COUNT(DISTINCT campaign_id) as value
FROM public.campaign_reactions

UNION ALL

SELECT 
  'Пользователей с реакциями' as metric,
  COUNT(DISTINCT user_id) as value
FROM public.campaign_reactions; 