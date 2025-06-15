-- SQL скрипт для дополнительной унификации каналов в таблице campaigns_v2
-- Выполнять ПОСЛЕ первого скрипта unify_channels.sql
-- ВАЖНО: поле channels имеет тип text[] (массив)

-- 1. Унификация внутренних каналов
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'внутренние каналы Авито', 'Внутренние каналы')
WHERE 'внутренние каналы Авито' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'внутренние коммуникации', 'Внутренние каналы')
WHERE 'внутренние коммуникации' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'внутри продукта', 'Внутренние каналы')
WHERE 'внутри продукта' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'точки входа в продукт', 'Внутренние каналы')
WHERE 'точки входа в продукт' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Продуктовая навигация', 'Внутренние каналы')
WHERE 'Продуктовая навигация' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Авито', 'Внутренние каналы')
WHERE 'Авито' = ANY(channels);

-- 2. Унификация SMM каналов
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'SMM (пре-ролл + интеграции VK/YT)', 'SMM')
WHERE 'SMM (пре-ролл + интеграции VK/YT)' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'SMM интеграции', 'SMM')
WHERE 'SMM интеграции' = ANY(channels);

-- 3. Унификация транспорта (включая вокзалы)
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Metro', 'Транспорт')
WHERE 'Metro' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Вокзалы', 'Транспорт')
WHERE 'Вокзалы' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Поезда', 'Транспорт')
WHERE 'Поезда' = ANY(channels);

-- Переименовываем существующий канал для единообразия
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Транспорт (метро, электрички и тд)', 'Транспорт')
WHERE 'Транспорт (метро, электрички и тд)' = ANY(channels);

-- 4. Унификация Indoor каналов
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Индор (ТЦ и БЦ)', 'Indoor')
WHERE 'Индор (ТЦ и БЦ)' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'тц', 'Indoor')
WHERE 'тц' = ANY(channels);

-- 5. Унификация посевов
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'посевы в ТГ каналах', 'Посевы')
WHERE 'посевы в ТГ каналах' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'посевы', 'Посевы')
WHERE 'посевы' = ANY(channels);

-- 6. Унификация специальных проектов
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'спецпроектный МФ с партнёрами', 'Special Project')
WHERE 'спецпроектный МФ с партнёрами' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'offline to online спец.проект', 'Special Project')
WHERE 'offline to online спец.проект' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'спонсорские заставки', 'Special Project')
WHERE 'спонсорские заставки' = ANY(channels);

-- 7. Унификация блогеров и влияния
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Influence', 'Bloggers')
WHERE 'Influence' = ANY(channels);

-- 8. Дополнительные унификации
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'ко-маркетинг', 'Партнерство')
WHERE 'ко-маркетинг' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Media', 'Digital')
WHERE 'Media' = ANY(channels);

-- Проверка результатов
-- Посмотреть все уникальные каналы после унификации
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