#!/bin/bash
set -e

# ============================================================================
# Django Production Entrypoint Script
# ============================================================================
# Этот скрипт выполняет необходимые операции перед запуском приложения:
# - Ожидание готовности PostgreSQL
# - Применение миграций
# - Сборка статических файлов
# - Запуск Gunicorn
# ============================================================================

echo "Starting Django application..."

# Функция для ожидания готовности PostgreSQL
wait_for_postgres() {
    echo "Waiting for PostgreSQL to be ready..."
    
    # Получение параметров подключения из переменных окружения
    PGHOST="${POSTGRES_HOST:-localhost}"
    PGPORT="${POSTGRES_PORT:-5432}"
    
    # Ожидание доступности PostgreSQL (максимум 30 попыток по 2 секунды = 60 секунд)
    until nc -z "$PGHOST" "$PGPORT" 2>/dev/null; do
        echo "PostgreSQL is unavailable - sleeping..."
        sleep 2
    done
    
    echo "PostgreSQL is up and running!"
}

# Функция для применения миграций
run_migrations() {
    echo "Running database migrations..."
    python manage.py migrate --noinput
    echo "Migrations completed successfully."
}

# Функция для сбора статических файлов
collect_static() {
    echo "Collecting static files..."
    python manage.py collectstatic --noinput --clear
    echo "Static files collected successfully."
}

# Функция для создания суперпользователя (опционально, только если нужно)
# create_superuser() {
#     if [ -n "$DJANGO_SUPERUSER_EMAIL" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
#         echo "Creating superuser..."
#         python manage.py createsuperuser --noinput || true
#     fi
# }

# Основная логика
main() {
    # Ожидание готовности PostgreSQL
    wait_for_postgres
    
    # Применение миграций
    run_migrations
    
    # Сборка статических файлов (только если не в режиме разработки)
    if [ "${DEBUG:-False}" != "True" ]; then
        collect_static
    fi
    
    # Создание суперпользователя (раскомментируйте если нужно)
    # create_superuser
    
    echo "Starting Gunicorn server..."
    
    # Если переменная PORT установлена (например, в Digital Ocean App Platform),
    # используем её, иначе используем порт по умолчанию 8080 (Digital Ocean стандарт)
    PORT="${PORT:-8080}"
    echo "Using port: ${PORT}"
    
    # Проверка, что мы в правильной директории
    if [ ! -f "manage.py" ]; then
        echo "ERROR: manage.py not found. Current directory: $(pwd)"
        echo "Contents: $(ls -la)"
        exit 1
    fi
    
    # Проверка, что модуль config.wsgi существует
    if [ ! -f "config/wsgi.py" ]; then
        echo "ERROR: config/wsgi.py not found"
        exit 1
    fi
    
    echo "Starting Gunicorn with config.wsgi:application on port ${PORT}..."
    
    # Если команда передана через CMD, проверяем её
    if [ $# -gt 0 ] && [ "$1" != "" ]; then
        # Если команда начинается с "gunicorn", добавляем параметры
        if [ "$1" = "gunicorn" ]; then
            echo "Executing gunicorn command with port ${PORT}..."
            exec "$@" --bind "0.0.0.0:${PORT}" \
                --workers 4 \
                --threads 2 \
                --timeout 120 \
                --access-logfile - \
                --error-logfile - \
                --log-level info
        else
            echo "Executing custom command: $@"
            exec "$@"
        fi
    else
        # Если команда не передана, запускаем gunicorn с полными параметрами
        echo "No command provided, starting gunicorn with default settings..."
        exec gunicorn config.wsgi:application \
            --bind "0.0.0.0:${PORT}" \
            --workers 4 \
            --threads 2 \
            --timeout 120 \
            --access-logfile - \
            --error-logfile - \
            --log-level info
    fi
}

# Запуск основной функции
main "$@"

