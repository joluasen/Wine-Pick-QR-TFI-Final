#!/usr/bin/env bash
set -e

: "${PORT:=10000}"

sed -ri "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

mkdir -p /var/www/html/public/uploads
chown -R www-data:www-data /var/www/html/public/uploads || true

apache2-foreground