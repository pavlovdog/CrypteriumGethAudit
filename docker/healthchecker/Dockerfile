FROM node:10.13-alpine

RUN apk add --update \
    git \
    python \
    make \
    alpine-sdk

WORKDIR /app/health-checker

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "index.js"]