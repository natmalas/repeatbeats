FROM php:8.3-fpm

# System deps
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    ffmpeg \
    python3 \
    python3-pip \
    pipx \
    nginx \
    supervisor \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install pdo pdo_mysql

RUN pecl install redis \
    && docker-php-ext-enable redis

# pipx path
ENV PATH="/root/.local/bin:$PATH"

RUN pipx install yt-dlp

WORKDIR /var/www/html

COPY . .

RUN chown -R www-data:www-data storage bootstrap/cache
RUN sed -i 's|listen = .*|listen = 127.0.0.1:9000|' /usr/local/etc/php-fpm.d/www.conf


# Install composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN composer install --no-dev --optimize-autoloader --no-scripts

# nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf

# supervisor to run php-fpm + nginx
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8080

CMD if [ "$ROLE" = "worker" ]; then \
        php artisan queue:work redis --sleep=1 --tries=3 --timeout=900; \
    else \
        supervisord -n; \
    fi
