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

echo "=========================================="
echo "Starting Django application..."
echo "=========================================="
echo "Arguments received: $@"
echo "Number of arguments: $#"
echo "Current directory: $(pwd)"
echo "Python path: $(which python)"
echo "Gunicorn path: $(which gunicorn || echo 'NOT FOUND')"
echo "DJANGO_SETTINGS_MODULE: ${DJANGO_SETTINGS_MODULE}"
echo "=========================================="

# Функция для ожидания готовности PostgreSQL
wait_for_postgres() {
    # Если переменная SKIP_DB_WAIT установлена, пропускаем ожидание
    if [ "${SKIP_DB_WAIT:-false}" = "true" ]; then
        echo "Skipping PostgreSQL wait (SKIP_DB_WAIT=true)"
        return 0
    fi
    
    echo "Waiting for PostgreSQL to be ready..."
    
    # Получение параметров подключения из переменных окружения
    PGHOST="${POSTGRES_HOST:-localhost}"
    PGPORT="${POSTGRES_PORT:-5432}"
    
    # Ожидание доступности PostgreSQL (максимум 30 попыток по 2 секунды = 60 секунд)
    MAX_ATTEMPTS=30
    ATTEMPT=0
    
    until nc -z "$PGHOST" "$PGPORT" 2>/dev/null; do
        ATTEMPT=$((ATTEMPT + 1))
        if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
            echo "WARNING: PostgreSQL is still unavailable after ${MAX_ATTEMPTS} attempts. Continuing anyway..."
            break
        fi
        echo "PostgreSQL is unavailable - sleeping... (attempt ${ATTEMPT}/${MAX_ATTEMPTS})"
        sleep 2
    done
    
    if nc -z "$PGHOST" "$PGPORT" 2>/dev/null; then
        echo "PostgreSQL is up and running!"
    else
        echo "WARNING: Could not verify PostgreSQL connection, but continuing..."
    fi
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
    # Ожидание готовности PostgreSQL (можно пропустить через SKIP_DB_WAIT=true)
    wait_for_postgres
    
    # Применение миграций (можно пропустить через SKIP_MIGRATIONS=true)
    if [ "${SKIP_MIGRATIONS:-false}" != "true" ]; then
        run_migrations
    else
        echo "Skipping migrations (SKIP_MIGRATIONS=true)"
    fi
    
    # Сборка статических файлов (только если не в режиме разработки)
    if [ "${DEBUG:-False}" != "True" ] && [ "${SKIP_COLLECTSTATIC:-false}" != "true" ]; then
        collect_static
    elif [ "${SKIP_COLLECTSTATIC:-false}" = "true" ]; then
        echo "Skipping collectstatic (SKIP_COLLECTSTATIC=true)"
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
    
    echo "=========================================="
    echo "Starting Gunicorn server..."
    echo "=========================================="
    echo "Port: ${PORT}"
    echo "Arguments: $@"
    echo "=========================================="
    
    # Всегда используем явную команду gunicorn с полными параметрами
    # Это гарантирует, что модуль приложения будет указан правильно
    APP_MODULE="config.wsgi:application"
    
    echo "Using application module: ${APP_MODULE}"
    echo "Starting Gunicorn with command:"
    echo "  gunicorn ${APP_MODULE} --bind 0.0.0.0:${PORT} --workers 4 --threads 2 --timeout 120"
    echo "=========================================="
    
    # Запускаем gunicorn с полными параметрами
    # Используем exec для замены процесса shell на gunicorn
    exec gunicorn "${APP_MODULE}" \
        --bind "0.0.0.0:${PORT}" \
        --workers 4 \
        --threads 2 \
        --timeout 120 \
        --access-logfile - \
        --error-logfile - \
        --log-level info \
        --chdir /app
}

# Запуск основной функции
main "$@"

