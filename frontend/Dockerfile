# Fase 1: Construcción del frontend con Node.js
FROM node:18-alpine AS builder

ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

# Fase 2: Servir con Nginx
FROM nginx:alpine

RUN apk add --no-cache gettext

# Copiar los archivos estáticos del frontend
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/nginx.conf.template

EXPOSE 80

# Reemplazar la variable en nginx.conf antes de ejecutar Nginx
CMD envsubst '$REACT_APP_BACKEND_URL' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && \
    nginx -g 'daemon off;'