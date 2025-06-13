#!/bin/bash

# Проверяем, передан ли email
if [ -z "$1" ]; then
  echo "Пожалуйста, укажите email пользователя"
  echo "Использование: ./update-user-role.sh <email>"
  exit 1
fi

# Запускаем скрипт с переданным email
npx ts-node scripts/update-user-role.ts "$1" 