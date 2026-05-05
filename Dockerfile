FROM php:8.1-fpm-alpine

# Install PHP extension installer
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# Install everything in one layer for smaller image size
RUN set -eux && \
    # Install all PHP extensions
    install-php-extensions \
        gd \
        mysqli \
        pdo \
        pdo_mysql \
        bcmath \
        intl \
        zip \
        opcache \
        soap \
        simplexml \
        exif \
        apcu && \
    # Install system packages
    apk add --no-cache \
        curl \
        unzip \
        nano \
        git && \
    # Install Composer
    curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
    # Configure PHP-FPM
    sed -i 's/daemonize = yes/daemonize = no/g' /usr/local/etc/php-fpm.d/zz-docker.conf && \
    # Create logs directory
    mkdir -p /var/log && \
    touch /var/log/php_errors.log && \
    chmod 777 /var/log/php_errors.log
