# 🚀 Инструкция по деплою на Digital Ocean

Это руководство описывает процесс деплоя Django backend приложения на Digital Ocean с использованием Docker.

## 📋 Предварительные требования

1. **Аккаунт Digital Ocean** с активной подпиской
2. **Droplet** (виртуальный сервер) с Ubuntu 22.04 LTS или новее
3. **PostgreSQL база данных** (можно использовать Digital Ocean Managed Database)
4. **Домен** (опционально, но рекомендуется)
5. **SSH доступ** к серверу

## 🔧 Шаг 1: Подготовка сервера

### 1.1 Подключение к серверу

```bash
ssh root@your-droplet-ip
```

### 1.2 Обновление системы

```bash
apt update && apt upgrade -y
```

### 1.3 Установка необходимых пакетов

```bash
apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git
```

### 1.4 Установка Docker

```bash
# Добавление официального GPG ключа Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавление репозитория Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Проверка установки
docker --version
docker compose version
```

### 1.5 Создание пользователя для приложения (опционально, но рекомендуется)

```bash
# Создание пользователя
adduser --disabled-password --gecos "" appuser
usermod -aG docker appuser

# Переключение на нового пользователя
su - appuser
```

## 🗄️ Шаг 2: Настройка базы данных

### Вариант A: Использование Digital Ocean Managed Database (Рекомендуется)

1. Перейдите в панель управления Digital Ocean
2. Создайте новый **Managed Database** (PostgreSQL)
3. Запишите следующие данные:
   - Host
   - Port
   - Database name
   - Username
   - Password
   - Connection pooler (опционально)

### Вариант B: Установка PostgreSQL на том же сервере

```bash
# Установка PostgreSQL
apt install -y postgresql postgresql-contrib

# Создание базы данных и пользователя
sudo -u postgres psql

# В psql консоли:
CREATE DATABASE street_screens;
CREATE USER street_screens_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE street_screens TO street_screens_user;
\q
```

## 📦 Шаг 3: Подготовка кода приложения

### 3.1 Клонирование репозитория

```bash
# Создание директории для приложения
mkdir -p /opt/street-screens
cd /opt/street-screens

# Клонирование репозитория (замените на ваш репозиторий)
git clone https://github.com/your-username/street-screens.git .

# Или загрузка кода через scp
# scp -r backend/ user@server:/opt/street-screens/
```

### 3.2 Переход в директорию backend

```bash
cd backend
```

## 🔐 Шаг 4: Настройка переменных окружения

### 4.1 Создание файла .env

```bash
nano .env
```

### 4.2 Добавление переменных окружения

```env
# Django Settings
SECRET_KEY=your-super-secret-key-change-this-in-production
DEBUG=False
ALLOWED_HOSTS=your-domain.com www.your-domain.com your-droplet-ip

# Database Configuration
POSTGRES_DB=street_screens
POSTGRES_USER=street_screens_user
POSTGRES_PASSWORD=your_secure_database_password
POSTGRES_HOST=your-database-host
POSTGRES_PORT=5432

# CORS Settings
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
CORS_ORIGIN_WHITELIST=https://your-frontend-domain.com
CSRF_TRUSTED_ORIGINS=https://your-domain.com https://www.your-domain.com

# JWT Settings
SIGNING_KEY=your-jwt-signing-key-change-this

# Optional: Email Configuration (если используется)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USE_TLS=True
# EMAIL_HOST_USER=your-email@gmail.com
# EMAIL_HOST_PASSWORD=your-app-password
```

**⚠️ ВАЖНО:** 
- Замените все значения на реальные
- Используйте сильные пароли
- Никогда не коммитьте .env файл в Git

### 4.3 Генерация SECRET_KEY

```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## 🐳 Шаг 5: Сборка и запуск Docker контейнера

### 5.1 Сборка образа

```bash
docker build -t street-screens-backend:latest .
```

### 5.2 Запуск контейнера

```bash
docker run -d \
  --name street-screens-web \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/media:/app/media \
  -v $(pwd)/static:/app/static \
  street-screens-backend:latest
```

### 5.3 Проверка работы

```bash
# Просмотр логов
docker logs -f street-screens-web

# Проверка health check
curl http://localhost:8000/health/

# Проверка статуса контейнера
docker ps
```

## 🌐 Шаг 6: Настройка Nginx (Reverse Proxy)

### 6.1 Установка Nginx

```bash
apt install -y nginx
```

### 6.2 Создание конфигурации Nginx

```bash
nano /etc/nginx/sites-available/street-screens
```

### 6.3 Конфигурация Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Редирект на HTTPS (после настройки SSL)
    # return 301 https://$server_name$request_uri;

    # Для начала используйте HTTP
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Таймауты для больших файлов
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # Статические файлы (опционально, если не используете WhiteNoise)
    location /static/ {
        alias /opt/street-screens/backend/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Медиа файлы
    location /media/ {
        alias /opt/street-screens/backend/media/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Увеличение размера загружаемых файлов
    client_max_body_size 100M;
}
```

### 6.4 Активация конфигурации

```bash
ln -s /etc/nginx/sites-available/street-screens /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 🔒 Шаг 7: Настройка SSL (Let's Encrypt)

### 7.1 Установка Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 7.2 Получение SSL сертификата

```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 7.3 Автоматическое обновление сертификата

Certbot автоматически настроит cron задачу для обновления сертификата.

## 🔄 Шаг 8: Настройка автоматического деплоя (CI/CD)

### 8.1 Создание скрипта деплоя

```bash
nano /opt/street-screens/deploy.sh
```

```bash
#!/bin/bash
set -e

cd /opt/street-screens/backend

# Остановка текущего контейнера
docker stop street-screens-web || true
docker rm street-screens-web || true

# Обновление кода (если используете Git)
git pull origin main

# Сборка нового образа
docker build -t street-screens-backend:latest .

# Запуск нового контейнера
docker run -d \
  --name street-screens-web \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/media:/app/media \
  -v $(pwd)/static:/app/static \
  street-screens-backend:latest

# Очистка старых образов
docker image prune -f

echo "Deployment completed successfully!"
```

```bash
chmod +x /opt/street-screens/deploy.sh
```

### 8.2 Настройка GitHub Actions (опционально)

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Digital Ocean

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: ${{ secrets.DROPLET_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/street-screens
            ./deploy.sh
```

## 📊 Шаг 9: Мониторинг и логи

### 9.1 Просмотр логов приложения

```bash
# Логи контейнера
docker logs -f street-screens-web

# Логи Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 9.2 Настройка мониторинга (опционально)

Рекомендуется использовать:
- **Digital Ocean Monitoring** (встроенный)
- **Sentry** для отслеживания ошибок
- **Uptime Robot** для мониторинга доступности

## 🔧 Шаг 10: Полезные команды

### Управление контейнером

```bash
# Остановка контейнера
docker stop street-screens-web

# Запуск контейнера
docker start street-screens-web

# Перезапуск контейнера
docker restart street-screens-web

# Просмотр логов
docker logs -f street-screens-web

# Вход в контейнер
docker exec -it street-screens-web bash

# Выполнение команд Django
docker exec -it street-screens-web python manage.py migrate
docker exec -it street-screens-web python manage.py createsuperuser
docker exec -it street-screens-web python manage.py collectstatic
```

### Обновление приложения

```bash
cd /opt/street-screens/backend
./deploy.sh
```

## 🐛 Решение проблем

### Проблема: Контейнер не запускается

```bash
# Проверка логов
docker logs street-screens-web

# Проверка статуса
docker ps -a

# Проверка подключения к БД
docker exec -it street-screens-web python manage.py dbshell
```

### Проблема: Ошибки миграций

```bash
# Откат миграций (осторожно!)
docker exec -it street-screens-web python manage.py migrate --fake

# Применение миграций вручную
docker exec -it street-screens-web python manage.py migrate
```

### Проблема: Статические файлы не загружаются

```bash
# Пересборка статики
docker exec -it street-screens-web python manage.py collectstatic --noinput --clear
```

### Проблема: Проблемы с правами доступа

```bash
# Исправление прав на медиа и статику
sudo chown -R 1000:1000 /opt/street-screens/backend/media
sudo chown -R 1000:1000 /opt/street-screens/backend/static
```

## 📝 Чеклист деплоя

- [ ] Сервер настроен и обновлен
- [ ] Docker установлен
- [ ] База данных настроена и доступна
- [ ] Код приложения загружен на сервер
- [ ] Файл .env создан и заполнен
- [ ] Docker образ собран
- [ ] Контейнер запущен и работает
- [ ] Health check endpoint отвечает
- [ ] Nginx настроен как reverse proxy
- [ ] SSL сертификат установлен
- [ ] Домен настроен и указывает на сервер
- [ ] Firewall настроен (открыты порты 80, 443, 22)
- [ ] Автоматический деплой настроен (опционально)
- [ ] Мониторинг настроен (опционально)

## 🔐 Безопасность

1. **Firewall**: Настройте UFW или iptables
   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

2. **SSH**: Используйте ключи вместо паролей
3. **База данных**: Используйте сильные пароли
4. **SECRET_KEY**: Генерируйте уникальные ключи
5. **DEBUG**: Всегда устанавливайте `DEBUG=False` в production
6. **ALLOWED_HOSTS**: Указывайте только ваши домены

## 📚 Дополнительные ресурсы

- [Digital Ocean Documentation](https://docs.digitalocean.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 💡 Советы

1. Используйте **Digital Ocean Managed Database** для production
2. Настройте **автоматические бэкапы** базы данных
3. Используйте **CDN** для статических файлов (Cloudflare, Digital Ocean Spaces)
4. Настройте **мониторинг** и **алерты**
5. Регулярно обновляйте зависимости и систему
6. Используйте **Docker Compose** для более сложных конфигураций

---

**Успешного деплоя! 🚀**

