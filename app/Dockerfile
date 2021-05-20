FROM node:15.3.0 as builder
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY ./package.json .
COPY ./yarn.lock .
RUN yarn

COPY ./tsconfig.json .
COPY src src
COPY public public

RUN yarn build

FROM alpine:3.13

WORKDIR /app

COPY --from=builder /app/build /app/build

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

VOLUME /var/www/static

ENTRYPOINT ["/app/docker-entrypoint.sh"]
