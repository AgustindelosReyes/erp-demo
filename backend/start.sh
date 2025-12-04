#!/bin/bash

# Generate app key if not set
if [ -z "$APP_KEY" ] || [ "$APP_KEY" == "base64:" ]; then
    php artisan key:generate
fi

# Wait for database
until php artisan migrate:status > /dev/null 2>&1; do
    echo "Waiting for database connection..."
    sleep 2
done

# Run migrations
php artisan migrate --force

# Run seeders
php artisan db:seed --force

# Start php-fpm
exec php-fpm