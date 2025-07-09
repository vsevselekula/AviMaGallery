#!/bin/bash

# Загружаем переменные окружения из .env.local с помощью Node.js и dotenv
# Убедитесь, что у вас установлен Node.js и пакет dotenv (npm install dotenv)
# Если dotenv не установлен глобально, используйте npx dotenv -e .env.local -- команду

# Получаем URL и Service Key из .env.local через Node.js
SUPABASE_URL=$(node -e 'require("dotenv").config({ path: ".env.local" }); console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);')
SUPABASE_SERVICE_ROLE_KEY=$(node -e 'require("dotenv").config({ path: ".env.local" }); console.log(process.env.SUPABASE_SERVICE_ROLE_KEY);')

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Ошибка: Не удалось загрузить переменные окружения NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY из .env.local"
  exit 1
fi

# Извлекаем хост базы данных из URL Supabase
DB_HOST=$(echo $SUPABASE_URL | sed -e 's|^[^/]*//||; s|/.*$||; s/:.*$//')

# Применяем SQL-скрипт через psql
PGPASSWORD=$SUPABASE_SERVICE_ROLE_KEY psql -h $DB_HOST -U postgres -d postgres -f scripts/add-user-roles-constraint.sql 