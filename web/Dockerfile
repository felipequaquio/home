FROM node:12-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
EXPOSE ${PORT}
CMD yarn start
