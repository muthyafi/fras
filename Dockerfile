FROM node:20-alpine AS build

RUN apk add git

WORKDIR /app
COPY package*.json ./
COPY .git ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx AS runtime
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80/tcp
