FROM node:10.13-alpine

RUN apk add --update \
    git \
    python \
    make \
    alpine-sdk

WORKDIR /app/health-checker

COPY health-checker/package*.json ./

RUN npm install

CMD ["node", "index.js"]