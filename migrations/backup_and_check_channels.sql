-- Скрипт для бэкапа и проверки унификации каналов
-- ВАЖНО: поле channels имеет тип text[] (массив)

-- 1. СОЗДАНИЕ БЭКАПА ПЕРЕД ИЗМЕНЕНИЯМИ
-- Выполните это ПЕРЕД запуском unify_channels.sql
CREATE TABLE campaigns_v2_backup AS 
SELECT * FROM campaigns_v2;

-- Проверка создания бэкапа
SELECT COUNT(*) as backup_count FROM campaigns_v2_backup;

-- 2. ПРОВЕРКА ТЕКУЩЕГО СОСТОЯНИЯ КАНАЛОВ (ДО УНИФИКАЦИИ)
-- Посмотреть все уникальные каналы и их частоту
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

-- Общее количество уникальных каналов ДО унификации
WITH channel_list AS (
  SELECT 
    unnest(channels) as channel
  FROM campaigns_v2 
  WHERE channels IS NOT NULL
)
SELECT COUNT(DISTINCT channel) as unique_channels_count
FROM channel_list;

-- 3. ПРОВЕРКА ПОСЛЕ УНИФИКАЦИИ
-- Запустите эти запросы ПОСЛЕ выполнения unify_channels.sql

-- Посмотреть все уникальные каналы и их частоту ПОСЛЕ унификации
/*
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
*/

-- Общее количество уникальных каналов ПОСЛЕ унификации
/*
WITH channel_list AS (
  SELECT 
    unnest(channels) as channel
  FROM campaigns_v2 
  WHERE channels IS NOT NULL
)
SELECT COUNT(DISTINCT channel) as unique_channels_count
FROM channel_list;
*/

-- 4. СРАВНЕНИЕ ДО И ПОСЛЕ
-- Запустите для сравнения количества уникальных каналов
/*
-- До унификации (из бэкапа)
WITH backup_channels AS (
  SELECT 
    unnest(channels) as channel
  FROM campaigns_v2_backup 
  WHERE channels IS NOT NULL
),
current_channels AS (
  SELECT 
    unnest(channels) as channel
  FROM campaigns_v2 
  WHERE channels IS NOT NULL
)
SELECT 
  'До унификации' as period,
  COUNT(DISTINCT channel) as unique_channels
FROM backup_channels
UNION ALL
SELECT 
  'После унификации' as period,
  COUNT(DISTINCT channel) as unique_channels
FROM current_channels;
*/

-- 5. ВОССТАНОВЛЕНИЕ ИЗ БЭКАПА (если что-то пошло не так)
-- ОСТОРОЖНО! Это удалит все изменения
/*
DROP TABLE campaigns_v2;
ALTER TABLE campaigns_v2_backup RENAME TO campaigns_v2;
*/ 