FROM node:15.3.0 as build-image
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn
COPY . .
RUN yarn build

FROM alpine:3.13

COPY --from=build-image /app/build /app

CMD ls /app