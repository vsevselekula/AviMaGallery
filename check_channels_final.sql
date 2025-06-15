-- Скрипт для проверки результатов полной унификации каналов
-- Выполнять ПОСЛЕ unify_channels.sql и unify_channels_v2.sql

-- 1. Посмотреть все уникальные каналы и их частоту ПОСЛЕ полной унификации
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

-- 2. Общее количество уникальных каналов ПОСЛЕ унификации
WITH channel_list AS (
  SELECT 
    unnest(channels) as channel
  FROM campaigns_v2 
  WHERE channels IS NOT NULL
)
SELECT 
  COUNT(DISTINCT channel) as unique_channels_count,
  COUNT(*) as total_channel_entries
FROM channel_list;

-- 3. Сравнение: сколько кампаний используют каждый канал
SELECT 
  channel,
  COUNT(DISTINCT id) as campaigns_count
FROM (
  SELECT 
    id,
    unnest(channels) as channel
  FROM campaigns_v2 
  WHERE channels IS NOT NULL
) t
GROUP BY channel
ORDER BY campaigns_count DESC;

-- 4. Топ-10 самых популярных каналов
WITH channel_list AS (
  SELECT 
    unnest(channels) as channel
  FROM campaigns_v2 
  WHERE channels IS NOT NULL
)
SELECT 
  channel,
  COUNT(*) as frequency,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM channel_list
GROUP BY channel
ORDER BY frequency DESC
LIMIT 10;

-- 5. Проверка на наличие дублей или проблемных записей
SELECT 
  id,
  campaign_name,
  channels
FROM campaigns_v2 
WHERE channels IS NOT NULL 
  AND (
    'Metro' = ANY(channels) OR 
    'внутренние каналы Авито' = ANY(channels) OR
    'SMM интеграции' = ANY(channels) OR
    'Авито' = ANY(channels)
  )
LIMIT 5; 