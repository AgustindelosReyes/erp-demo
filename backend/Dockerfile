FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    nodejs \
    npm \
    default-mysql-client \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy composer files first for better caching
COPY composer.json composer.lock ./

# Install PHP dependencies (before copying source to cache better)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Copy package files for Node.js
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code (after dependencies for better caching)
COPY . .

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Build assets
RUN npm run build && npm prune --production

# Change ownership of our applications
RUN chown -R www-data:www-data /var/www

# Expose port 9000
EXPOSE 9000

# Use entrypoint script
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]