FROM node:15.3.0 as builder
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn
COPY . .
ENTRYPOINT ["yarn", "build"]

FROM alpine:3.13

COPY --from=build-image /app /app

CMD ls /app