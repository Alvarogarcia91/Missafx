# ==========================================
# Etapa 1: Build de la aplicación React (Vite)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

ENV HTTP_PROXY="" \
    HTTPS_PROXY="" \
    http_proxy="" \
    https_proxy=""

COPY package.json ./

RUN npm config delete proxy && \
    npm config delete https-proxy && \
    npm config set registry https://registry.npmjs.org/ && \
    npm install --no-audit --no-fund

COPY . .

RUN npm run build

# ==========================================
# Etapa 2: Servidor Nginx Alpine de Producción
# ==========================================
FROM nginx:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
