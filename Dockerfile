### Client build stage
FROM node:12-alpine AS frontend

WORKDIR /usr/src/app

COPY ./src/client/ ./

RUN npm install
RUN npm run build


### Composer vendor build stage
FROM composer as vendor

COPY ./src/server/composer.json ./

RUN composer install \
  --ignore-platform-reqs \
  --no-interaction \
  --no-plugins \
  --no-scripts \
  --prefer-dist


### Server stage
FROM php:7.3-fpm

RUN apt-get update && apt-get install -y \
  libfreetype6-dev \
  libjpeg62-turbo-dev \
  git \
  libpng-dev \
  && docker-php-ext-install -j$(nproc) iconv \
  && docker-php-ext-configure gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/ \
  && docker-php-ext-install -j$(nproc) gd


WORKDIR /usr/src/app

COPY ./src/server ./

RUN mkdir -p images/{small,medium,large}

# Copy built files
COPY --from=vendor /app/vendor/ ./vendor/
COPY --from=frontend /usr/src/app/dist ./public/

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "./public", "./router.php"]