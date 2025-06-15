-- SQL скрипт для очистки названий кампаний от префиксов T1/T2/Т1/Т2
-- Выполнять в PostgreSQL для таблицы campaigns_v2

-- 1. СОЗДАНИЕ БЭКАПА ПЕРЕД ИЗМЕНЕНИЯМИ
-- Выполните это ПЕРЕД основными изменениями

-- Удаляем старую таблицу бэкапа если существует
DROP TABLE IF EXISTS campaigns_v2_names_backup;

-- Создаем новую таблицу бэкапа
CREATE TABLE campaigns_v2_names_backup AS 
SELECT id, campaign_name FROM campaigns_v2;

-- Проверка создания бэкапа
SELECT COUNT(*) as backup_count FROM campaigns_v2_names_backup;

-- 2. ПРОСМОТР ТЕКУЩИХ НАЗВАНИЙ С ПРЕФИКСАМИ (для проверки)
-- Посмотреть какие кампании содержат префиксы
SELECT 
  id,
  campaign_name,
  campaign_type
FROM campaigns_v2 
WHERE 
  campaign_name ~* '^(T1|T2|Т1|Т2)\s+' -- Регулярное выражение для поиска префиксов в начале строки
ORDER BY campaign_name;

-- 3. ОСНОВНЫЕ ОБНОВЛЕНИЯ
-- Удаляем "T1 " в начале названия (английская T)
UPDATE campaigns_v2 
SET campaign_name = TRIM(REGEXP_REPLACE(campaign_name, '^T1\s+', '', 'i'))
WHERE campaign_name ~* '^T1\s+';

-- Удаляем "T2 " в начале названия (английская T)
UPDATE campaigns_v2 
SET campaign_name = TRIM(REGEXP_REPLACE(campaign_name, '^T2\s+', '', 'i'))
WHERE campaign_name ~* '^T2\s+';

-- Удаляем "Т1 " в начале названия (русская Т)
UPDATE campaigns_v2 
SET campaign_name = TRIM(REGEXP_REPLACE(campaign_name, '^Т1\s+', '', 'i'))
WHERE campaign_name ~* '^Т1\s+';

-- Удаляем "Т2 " в начале названия (русская Т)
UPDATE campaigns_v2 
SET campaign_name = TRIM(REGEXP_REPLACE(campaign_name, '^Т2\s+', '', 'i'))
WHERE campaign_name ~* '^Т2\s+';

-- Дополнительная очистка: удаляем префиксы без пробела (если есть)
UPDATE campaigns_v2 
SET campaign_name = TRIM(REGEXP_REPLACE(campaign_name, '^(T1|T2|Т1|Т2)', '', 'i'))
WHERE campaign_name ~* '^(T1|T2|Т1|Т2)[^a-zA-Zа-яА-Я]';

-- Удаляем "РК" из названий кампаний (в начале, середине или конце)
-- Удаляем "РК " в начале названия
UPDATE campaigns_v2 
SET campaign_name = TRIM(REGEXP_REPLACE(campaign_name, '^РК\s+', '', 'i'))
WHERE campaign_name ~* '^РК\s+';

-- Удаляем " РК " в середине названия
UPDATE campaigns_v2 
SET campaign_name = TRIM(REGEXP_REPLACE(campaign_name, '\s+РК\s+', ' ', 'gi'))
WHERE campaign_name ~* '\s+РК\s+';

-- Удаляем " РК" в конце названия
UPDATE campaigns_v2 
SET campaign_name = TRIM(REGEXP_REPLACE(campaign_name, '\s+РК$', '', 'i'))
WHERE campaign_name ~* '\s+РК$';

-- Удаляем одиночное "РК" (если название состоит только из "РК")
UPDATE campaigns_v2 
SET campaign_name = TRIM(REGEXP_REPLACE(campaign_name, '^РК$', '', 'i'))
WHERE campaign_name ~* '^РК$';

-- 4. ПРОВЕРКА РЕЗУЛЬТАТОВ
-- Посмотреть измененные кампании
SELECT 
  b.campaign_name as old_name,
  c.campaign_name as new_name,
  c.campaign_type,
  c.id
FROM campaigns_v2_names_backup b
JOIN campaigns_v2 c ON b.id = c.id
WHERE b.campaign_name != c.campaign_name
ORDER BY c.campaign_name;

-- Статистика изменений
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN b.campaign_name != c.campaign_name THEN 1 END) as changed_campaigns,
  ROUND(
    COUNT(CASE WHEN b.campaign_name != c.campaign_name THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as percentage_changed
FROM campaigns_v2_names_backup b
JOIN campaigns_v2 c ON b.id = c.id;

-- Проверка, что не осталось префиксов T1/T2/Т1/Т2
SELECT 
  id,
  campaign_name,
  campaign_type
FROM campaigns_v2 
WHERE campaign_name ~* '^(T1|T2|Т1|Т2)\s*'
ORDER BY campaign_name;

-- Проверка, что не осталось "РК" в названиях
SELECT 
  id,
  campaign_name,
  campaign_type
FROM campaigns_v2 
WHERE campaign_name ~* 'РК'
ORDER BY campaign_name;

-- 5. ДОПОЛНИТЕЛЬНАЯ ОЧИСТКА (если нужно)
-- Удаляем лишние пробелы в начале и конце названий
UPDATE campaigns_v2 
SET campaign_name = TRIM(campaign_name)
WHERE campaign_name != TRIM(campaign_name);

-- Заменяем множественные пробелы на одинарные
UPDATE campaigns_v2 
SET campaign_name = REGEXP_REPLACE(campaign_name, '\s+', ' ', 'g')
WHERE campaign_name ~ '\s{2,}';

-- 6. ФИНАЛЬНАЯ ПРОВЕРКА
-- Посмотреть все названия после очистки
SELECT 
  campaign_name,
  campaign_type,
  COUNT(*) as count
FROM campaigns_v2 
GROUP BY campaign_name, campaign_type
ORDER BY campaign_name;

-- ОТКАТ ИЗМЕНЕНИЙ (если что-то пошло не так)
-- ВНИМАНИЕ: Выполнять только если нужно откатить изменения!
/*
UPDATE campaigns_v2 
SET campaign_name = b.campaign_name
FROM campaigns_v2_names_backup b
WHERE campaigns_v2.id = b.id;
*/ 