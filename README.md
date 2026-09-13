# 🎧 DJ MISSA (Missafx) — Official Landing Page

Sitio web oficial y landing page para **DJ Missa**, productor musical y DJ de música electrónica (Tech House / Melodic / Progressive).

Desarrollada con **React 18 + Vite** y containerizada con **Docker + Nginx Alpine** para despliegue de alta disponibilidad en **DigitalOcean**.

---

## 🚀 Características

- ⚡ **Construcción Multi-Stage en Docker**: Cero dependencias instaladas en tu máquina física; todo el proceso de `npm install` y build se ejecuta aislado dentro del contenedor.
- 🌐 **Servidor de Producción Nginx Alpine**: Imagen ultra ligera (~25MB) con compresión Gzip activa, cabeceras de seguridad HTTP y soporte para rutas SPA.
- 🎛️ **Diseño Audiovisual Premium**: Estética oscura, efectos neón/glow, tipografía moderna ('Syne' y 'Outfit'), reproductor interactivo con simulación de audio y visualizador de ecualizador en vivo.
- 📅 **Secciones Clave**:
  - **Hero**: Presentación estelar, llamada a la acción y estadísticas.
  - **Música & Sets**: Catálogo filtrable por categorías (Original Mixes, Live Sets, Remixes) con enlaces a Spotify, SoundCloud y Beatport.
  - **Tour 2026**: Fechas de presentaciones, venues, ciudades y estado de boletos.
  - **Biografía & Rider**: Historia del artista y especificaciones técnicas para promotores.
  - **Booking**: Formulario de contratación para festivales y clubs con botón directo a WhatsApp y correo oficial.

---

## 🐳 Ejecución Local con Docker

Para correr la landing page en tu máquina utilizando Docker (sin instalar Node ni npm localmente):

### 1. Construir y levantar con Docker Compose
```bash
docker compose up -d --build
```

### 2. Abrir en el navegador
Visita: [http://localhost](http://localhost) (o [http://localhost:80](http://localhost:80))

> **Nota:** Si el puerto 80 está ocupado en tu máquina, puedes cambiarlo pasando la variable `PORT`:
> ```bash
> PORT=8080 docker compose up -d --build
> ```
> Y abrir en [http://localhost:8080](http://localhost:8080).

### 3. Detener el contenedor
```bash
docker compose down
```

---

## 🌊 Despliegue en DigitalOcean

Tienes dos opciones recomendadas para desplegar en DigitalOcean:

### Opción A: DigitalOcean Droplet (Docker Compose) - Recomendado

1. **Crear el Droplet**:
   - En el panel de DigitalOcean, selecciona un Droplet básico (1 GB RAM / 1 vCPU es más que suficiente).
   - En la pestaña **Marketplace**, puedes elegir la imagen preconfigurada de **Docker on Ubuntu**.
2. **Conectarte por SSH al Droplet**:
   ```bash
   ssh root@TU_IP_DIGITALOCEAN
   ```
3. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Alvarogarcia91/Missafx.git
   cd Missafx
   ```
4. **Levantar el contenedor**:
   ```bash
   docker compose up -d --build
   ```
5. *(Opcional)* **Configurar Dominio y SSL con Certbot**:
   Si apuntas tu dominio (ej. `missafx.com`) a la IP del Droplet:
   ```bash
   apt-get install -y certbot python3-certbot-nginx
   ```

---

### Opción B: DigitalOcean App Platform

1. Ve a **Apps** en DigitalOcean y haz clic en **Create App**.
2. Conecta tu cuenta de **GitHub** y selecciona el repositorio `Alvarogarcia91/Missafx`.
3. DigitalOcean detectará automáticamente el `Dockerfile`.
4. Elige el plan **Starter** o **Basic** y haz clic en **Deploy**. ¡Listo!

---

## 📁 Estructura del Proyecto

```
Missafx/
├── .dockerignore
├── .gitignore
├── docker-compose.yml     # Orquestación del contenedor
├── Dockerfile             # Multi-stage build (Node 20 -> Nginx Alpine)
├── nginx.conf             # Servidor web optimizado con Gzip y Cache
├── package.json           # Dependencias React y Vite
├── vite.config.js         # Configuración de Vite
├── index.html             # HTML5 principal con fuentes y SEO
└── src/
    ├── main.jsx           # Punto de entrada de React
    ├── App.jsx            # Estructura principal de la app
    ├── index.css          # Estilos globales, variables y animaciones
    └── components/
        ├── Navbar.jsx     # Navegación responsiva
        ├── Hero.jsx       # Portada y presentación del DJ
        ├── MusicPlayer.jsx# Catálogo y reproductor interactivo
        ├── TourDates.jsx  # Fechas del tour
        ├── About.jsx      # Biografía y Rider técnico
        ├── Booking.jsx    # Formulario y WhatsApp de contratación
        └── Footer.jsx     # Redes sociales y créditos
```
