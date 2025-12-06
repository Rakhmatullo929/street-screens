# ============================================================================
# Multi-stage Dockerfile for Django Production Deployment
# ============================================================================
# Stage 1: Builder - для установки зависимостей и сборки статики
# ============================================================================
FROM python:3.11-slim as builder

# Установка системных зависимостей для сборки
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Создание виртуального окружения
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Установка зависимостей Python
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /tmp/requirements.txt

# ============================================================================
# Stage 2: Runtime - минимальный production образ
# ============================================================================
FROM python:3.11-slim

# Метаданные образа
LABEL maintainer="Street Screens Team"
LABEL description="Django 5.2.9 Production Image"

# Установка только runtime зависимостей для PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Копирование виртуального окружения из builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Создание непривилегированного пользователя для безопасности
RUN groupadd -r django && useradd -r -g django -u 1000 django

# Настройка рабочей директории
WORKDIR /app

# Копирование кода приложения
COPY --chown=django:django . /app/

# Создание директорий для статики и медиа
RUN mkdir -p /app/static /app/media && \
    chown -R django:django /app/static /app/media

# Переключение на непривилегированного пользователя
USER django

# Переменные окружения
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DJANGO_SETTINGS_MODULE=config.settings

# Открытие порта
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health/ || exit 1

# Entrypoint скрипт
COPY --chown=django:django entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Запуск через entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Команда по умолчанию (будет переопределена в entrypoint.sh)
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--threads", "2", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-"]

