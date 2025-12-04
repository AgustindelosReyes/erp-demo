#!/bin/bash

# Wait for database to be ready
echo "Waiting for database connection..."
while ! mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USERNAME" -p"$DB_PASSWORD" --silent; do
    echo "Database not ready, waiting..."
    sleep 2
done
echo "Database is ready!"

# Set permissions for Laravel storage and bootstrap cache
chown -R www-data:www-data /var/www/storage
chown -R www-data:www-data /var/www/bootstrap/cache
chmod -R 775 /var/www/storage
chmod -R 775 /var/www/bootstrap/cache

# Generate application key if not set
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:cGxlYXNlX3VzZV9hX3NlY3VyZV9yYW5kb21fa2V5X2hlcmU=" ]; then
    echo "Generating application key..."
    php artisan key:generate
fi

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force

# Seed the database
echo "Seeding database..."
php artisan db:seed --force

# Start PHP-FPM
echo "Starting PHP-FPM..."
exec php-fpm