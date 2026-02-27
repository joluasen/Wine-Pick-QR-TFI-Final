FROM php:8.2-apache

# MySQLi (tu proyecto lo usa)
RUN docker-php-ext-install mysqli

# Certificados (para TLS/SSL)
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

RUN a2enmod rewrite headers

# DocumentRoot => /public
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
 && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

WORKDIR /var/www/html
COPY . /var/www/html

# (Aiven) si vas a commitear el CA:
COPY certs/aiven-ca.pem /etc/ssl/certs/aiven-ca.pem

RUN mkdir -p /var/www/html/public/uploads \
 && chown -R www-data:www-data /var/www/html/public/uploads

COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]