FROM node:12-alpine AS client

WORKDIR /usr/src/app

COPY ./src/client/package*.json .

RUN npm install
RUN npm run build



FROM php:7.3-fpm

RUN apt-get update && apt-get install -y \
  libfreetype6-dev \
  libjpeg62-turbo-dev \
  libpng-dev \
  && docker-php-ext-install -j$(nproc) iconv \
  && docker-php-ext-configure gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/ \
  && docker-php-ext-install -j$(nproc) gd

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /usr/src/app

COPY ./src/server .

RUN php composer.phar install

COPY --from=client /usr/src/app/dist ./public/

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080"]