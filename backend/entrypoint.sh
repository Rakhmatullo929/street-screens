#!/bin/bash
set -e
"""
Этот скрипт выполняет необходимые операции перед запуском приложения:
- Ожидание готовности PostgreSQL
- Применение миграций
- Сборка статических файлов
- Запуск Gunicorn
"""
echo "Starting Django application..."

wait_for_postgres() {
    echo "Waiting for PostgreSQL to be ready..."
    
    PGHOST="${POSTGRES_HOST:-localhost}"
    PGPORT="${POSTGRES_PORT:-5432}"
    
    until nc -z "$PGHOST" "$PGPORT" 2>/dev/null; do
        echo "PostgreSQL is unavailable - sleeping..."
        sleep 2
    done
    
    echo "PostgreSQL is up and running!"
}

run_migrations() {
    echo "Running database migrations..."
    python manage.py migrate --noinput
    echo "Migrations completed successfully."
}

collect_static() {
    echo "Collecting static files..."
    python manage.py collectstatic --noinput --clear
    echo "Static files collected successfully."
}

"""Функция для создания суперпользователя (опционально, только если нужно)"""
# create_superuser() {
#     if [ -n "$DJANGO_SUPERUSER_EMAIL" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
#         echo "Creating superuser..."
#         python manage.py createsuperuser --noinput || true
#     fi
# }

"""Основная логика"""
main() {
    wait_for_postgres
    
    run_migrations
    
    if [ "${DEBUG:-False}" != "True" ]; then
        collect_static
    fi
    
    # create_superuser
    
    echo "Starting Gunicorn server..."
    
    exec "$@"
}

main "$@"

