-- SQL скрипт для унификации каналов в таблице campaigns_v2
-- Выполнять по частям, проверяя результаты
-- ВАЖНО: поле channels имеет тип text[] (массив)

-- 1. Унификация Digital каналов
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Диджитал', 'Digital')
WHERE 'Диджитал' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'диджитал', 'Digital')
WHERE 'диджитал' = ANY(channels);

-- 2. Унификация OOH (наружная реклама) + добавление DOOH
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Наружная реклама', 'OOH')
WHERE 'Наружная реклама' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'наружная реклама', 'OOH')
WHERE 'наружная реклама' = ANY(channels);

-- Диджитал наружка -> DOOH
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'диджитал наружка', 'DOOH')
WHERE 'диджитал наружка' = ANY(channels);

-- 3. Унификация Медиафасадов
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Медиа фасады', 'Медиафасады')
WHERE 'Медиа фасады' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'MF', 'Медиафасады')
WHERE 'MF' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'МФ', 'Медиафасады')
WHERE 'МФ' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'медиафасады', 'Медиафасады')
WHERE 'медиафасады' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'медиафасад', 'Медиафасады')
WHERE 'медиафасад' = ANY(channels);

-- 4. Унификация AoA (оставляем только AoA)
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'АнА', 'AoA')
WHERE 'АнА' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Avito on Avito', 'AoA')
WHERE 'Avito on Avito' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'внутренние инструменты (АнА)', 'AoA')
WHERE 'внутренние инструменты (АнА)' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'внутренние инструменты', 'AoA')
WHERE 'внутренние инструменты' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Внутренние инструменты', 'AoA')
WHERE 'Внутренние инструменты' = ANY(channels);

-- 5. Остальные внутренние каналы -> "Внутренние каналы"
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'shutter', 'Внутренние каналы')
WHERE 'shutter' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'stories', 'Внутренние каналы')
WHERE 'stories' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'CRM', 'Внутренние каналы')
WHERE 'CRM' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'точки входа', 'Внутренние каналы')
WHERE 'точки входа' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Точки входа', 'Внутренние каналы')
WHERE 'Точки входа' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'внутренние каналы', 'Внутренние каналы')
WHERE 'внутренние каналы' = ANY(channels);

-- 6. Унификация SMM
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'smm', 'SMM')
WHERE 'smm' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'СММ', 'SMM')
WHERE 'СММ' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'соцсети', 'SMM')
WHERE 'соцсети' = ANY(channels);

-- 7. Унификация Special Project
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'SP', 'Special Project')
WHERE 'SP' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Спецпроект', 'Special Project')
WHERE 'Спецпроект' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'спецпроект', 'Special Project')
WHERE 'спецпроект' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'спец проект', 'Special Project')
WHERE 'спец проект' = ANY(channels);

-- 8. Унификация транспорта
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Метро', 'Транспорт (метро, электрички и тд)')
WHERE 'Метро' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'метро', 'Транспорт (метро, электрички и тд)')
WHERE 'метро' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Электрички', 'Транспорт (метро, электрички и тд)')
WHERE 'Электрички' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'электрички', 'Транспорт (метро, электрички и тд)')
WHERE 'электрички' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'транспорт', 'Транспорт (метро, электрички и тд)')
WHERE 'транспорт' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Транспорт', 'Транспорт (метро, электрички и тд)')
WHERE 'Транспорт' = ANY(channels);

-- 9. Унификация Performance Marketing
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'PM', 'Performance Marketing')
WHERE 'PM' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'performance marketing', 'Performance Marketing')
WHERE 'performance marketing' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'Performance', 'Performance Marketing')
WHERE 'Performance' = ANY(channels);

-- 10. Унификация PR
UPDATE campaigns_v2 
SET channels = array_replace(channels, 'pr', 'PR')
WHERE 'pr' = ANY(channels);

UPDATE campaigns_v2 
SET channels = array_replace(channels, 'пиар', 'PR')
WHERE 'пиар' = ANY(channels);

-- Проверка результатов после выполнения
-- Запустите этот запрос для проверки:
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