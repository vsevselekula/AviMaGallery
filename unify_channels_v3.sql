-- Финальный SQL скрипт унификации каналов в таблице campaigns_v2
-- Выполнять ПОСЛЕ unify_channels.sql и unify_channels_v2.sql
-- ВАЖНО: поле channels имеет тип text[] (массив)

-- 1. Объединяем Bloggers и Посевы
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Посевы', 'Bloggers')
WHERE 'Посевы' = ANY(channels);

-- 2. Digital объединяем с DOOH и называем DOOH
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Digital', 'DOOH')
WHERE 'Digital' = ANY(channels);

-- 3. AoA CRM объединяем с AoA
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'AoA CRM', 'AoA')
WHERE 'AoA CRM' = ANY(channels);

-- 4. Сложная замена: internal channels (AoA, shutter, stories, CRM) → AoA + Внутренние каналы
-- Сначала находим записи с этим каналом и заменяем на два канала
UPDATE campaigns_v2 
SET channels = array_remove(
    array_append(
        array_append(channels, 'AoA'), 
        'Внутренние каналы'
    ), 
    'internal channels (AoA, shutter, stories, CRM)'
)
WHERE 'internal channels (AoA, shutter, stories, CRM)' = ANY(channels);

-- Проверяем результат
-- Посмотреть все уникальные каналы после финальной унификации
WITH channel_list AS (
  SELECT 
    unnest(channels) as channel
  FROM campaigns_v2 
  WHERE channels IS NOT NULL
)
SELECT 
  channel,
  COUNT(*) as frequency
FROM channel_list
GROUP BY channel
ORDER BY frequency DESC;

-- Дополнительная проверка: убедимся, что старые каналы исчезли
SELECT 
  'Проверка на остатки старых каналов:' as check_title;

SELECT 
  id,
  campaign_name,
  channels
FROM campaigns_v2 
WHERE channels IS NOT NULL 
  AND (
    'Посевы' = ANY(channels) OR 
    'Digital' = ANY(channels) OR
    'AoA CRM' = ANY(channels) OR
    'internal channels (AoA, shutter, stories, CRM)' = ANY(channels)
  )
LIMIT 10; 