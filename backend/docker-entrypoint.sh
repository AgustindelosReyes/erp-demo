#!/bin/bash

set -e

# Wait for MySQL
echo "Waiting for MySQL..."
while ! mysqladmin ping -h mysql -u root -p${MYSQL_ROOT_PASSWORD} --silent; do
  sleep 1
done
echo "MySQL is ready."

# Generate APP_KEY if not set
if [ -z "$APP_KEY" ]; then
  echo "Generating APP_KEY..."
  php artisan key:generate
fi

# Run database migrations
echo "Running migrations..."
php artisan migrate --force

# Seed the database
echo "Seeding database..."
php artisan db:seed --force

# Start PHP-FPM
echo "Starting PHP-FPM..."
exec php-fpm