# ==========================================
# Etapa 1: Build de la aplicación React (Vite)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json ./

# Instalar dependencias dentro del contenedor (sin tocar la máquina local)
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Generar el bundle de producción
RUN npm run build

# ==========================================
# Etapa 2: Servidor Nginx Alpine de Producción
# ==========================================
FROM nginx:1.27-alpine AS production

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos construidos desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto HTTP
EXPOSE 80

# Healthcheck para DigitalOcean / Docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
