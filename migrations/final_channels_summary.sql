-- Итоговый скрипт проверки результатов полной унификации каналов
-- Выполнять ПОСЛЕ всех скриптов унификации

-- 1. ФИНАЛЬНЫЙ СПИСОК всех каналов после унификации
SELECT 
  '=== ФИНАЛЬНЫЙ СПИСОК КАНАЛОВ ===' as title;

WITH channel_list AS (
  SELECT 
    unnest(channels) as channel
  FROM campaigns_v2 
  WHERE channels IS NOT NULL
)
SELECT 
  ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank,
  channel,
  COUNT(*) as frequency,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM channel_list
GROUP BY channel
ORDER BY frequency DESC;

-- 2. СТАТИСТИКА унификации
SELECT 
  '=== СТАТИСТИКА УНИФИКАЦИИ ===' as title;

WITH channel_stats AS (
  SELECT 
    COUNT(DISTINCT unnest(channels)) as unique_channels,
    COUNT(unnest(channels)) as total_entries
  FROM campaigns_v2 
  WHERE channels IS NOT NULL
)
SELECT 
  unique_channels as "Уникальных каналов",
  total_entries as "Всего записей каналов",
  ROUND(total_entries::numeric / unique_channels, 2) as "Среднее использование на канал"
FROM channel_stats;

-- 3. ТОП-10 самых используемых каналов
SELECT 
  '=== ТОП-10 КАНАЛОВ ===' as title;

WITH channel_list AS (
  SELECT 
    unnest(channels) as channel
  FROM campaigns_v2 
  WHERE channels IS NOT NULL
)
SELECT 
  channel as "Канал",
  COUNT(*) as "Частота",
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as "% от общего"
FROM channel_list
GROUP BY channel
ORDER BY COUNT(*) DESC
LIMIT 10;

-- 4. ПРОВЕРКА на дубликаты в массивах (один канал несколько раз в одной кампании)
SELECT 
  '=== ПРОВЕРКА НА ДУБЛИКАТЫ В КАМПАНИЯХ ===' as title;

SELECT 
  id,
  campaign_name,
  channels,
  array_length(channels, 1) as channels_count,
  array_length(array(SELECT DISTINCT unnest(channels)), 1) as unique_channels_count
FROM campaigns_v2 
WHERE channels IS NOT NULL 
  AND array_length(channels, 1) != array_length(array(SELECT DISTINCT unnest(channels)), 1)
LIMIT 5;

-- 5. КАМПАНИИ с наибольшим количеством каналов
SELECT 
  '=== КАМПАНИИ С НАИБОЛЬШИМ КОЛИЧЕСТВОМ КАНАЛОВ ===' as title;

SELECT 
  campaign_name,
  channels,
  array_length(channels, 1) as channels_count
FROM campaigns_v2 
WHERE channels IS NOT NULL
ORDER BY array_length(channels, 1) DESC
LIMIT 5; 