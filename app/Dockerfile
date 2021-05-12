FROM node:15.3.0 as builder
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn
COPY . .
RUN yarn build

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

VOLUME /var/www/static

ENTRYPOINT ["/app/docker-entrypoint.sh"]
