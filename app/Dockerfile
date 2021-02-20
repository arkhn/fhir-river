FROM node:15.3.0 as builder
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn
COPY . .
ENTRYPOINT ["yarn", "build"]
