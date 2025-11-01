#!/bin/bash

# Скрипт для выкладывания Atlas Debug Suite на GitHub
# Использование: ./deploy.sh YOUR_GITHUB_USERNAME

if [ -z "$1" ]; then
  echo "❌ Ошибка: укажи GitHub username"
  echo "Использование: ./deploy.sh YOUR_GITHUB_USERNAME"
  exit 1
fi

USERNAME=$1
REPO_NAME="atlas-debug-suite"

echo "🚀 Настраиваю репозиторий..."

# Добавляем remote
git remote add origin https://github.com/$USERNAME/$REPO_NAME.git 2>/dev/null || \
  git remote set-url origin https://github.com/$USERNAME/$REPO_NAME.git

# Проверяем remote
echo "📡 Remote настроен:"
git remote -v

echo ""
echo "📤 Отправляю код на GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Успешно выложено!"
  echo "🌐 Репозиторий: https://github.com/$USERNAME/$REPO_NAME"
else
  echo ""
  echo "❌ Ошибка при отправке. Убедись что:"
  echo "   1. Репозиторий создан на GitHub"
  echo "   2. У тебя есть доступ (авторизован в git)"
  echo "   3. Правильный username: $USERNAME"
fi

