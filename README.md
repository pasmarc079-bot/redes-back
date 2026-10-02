# Ministerio REDES - Sitio Web

Sitio web oficial del Ministerio Cristiano REDES de Lago Agrio, Ecuador.

## Stack

| Capa | Tecnología |
|------|-----------|
| **Frontend + Admin** | React + Vite + Tailwind CSS + Framer Motion + TipTap/BlockNote |
| **Backend API** | Node.js + Express + TypeScript + Prisma |
| **Base de Datos** | PostgreSQL 16 |
| **Imágenes** | Cloudinary (CDN global, optimización automática) |
| **Auth** | JWT + bcrypt |

## Identidad Visual

- **Colores:** Dorado (`#C9A84C`) + Negro (`#1A1A1A`) — basados en el logo oficial
- **Tipografías:** Montserrat (headings), Inter (body), Bebas Neue (display)
- **Tono:** Celebrativo, espiritual, familiar, accesible

## Redes Sociales

Gestionadas dinámicamente vía el panel de administración (Settings > Redes Sociales).

- Facebook, YouTube, TikTok, Instagram, WhatsApp

## Desarrollo Local

### 1. Base de datos

```bash
docker compose up -d postgres
```

### 2. Backend

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 3. Frontend (incluye Admin)

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
# Admin: http://localhost:5173/admin/login
# Login: pasmarc079 / Excelencia079
```

## Despliegue en Seenode

Cada servicio se despliega de forma independiente como **Web Service** en Seenode:

| Servicio | Root Dir | Build Command | Start Command | Port |
|----------|----------|---------------|---------------|------|
| **Backend** | `backend` | `npm ci && npx prisma generate && npm run build` | `npm start` (migrate + seed inicial seguro + server) | 8080 |
| **Frontend** | `frontend` | `npm install && npm run build` | `node server.cjs` | 8080 |

### Base de datos

Crear un **PostgreSQL managed** en Seenode y usar el connection string como `DATABASE_URL` en el backend.

### Guía completa

Ver [docs/deployment-seenode.md](docs/deployment-seenode.md) para instrucciones paso a paso.

## Credenciales por defecto

| Rol | Usuario | Contraseña |
|-----|---------|-----------|
| Admin | pasmarc079 | Excelencia079 |
| Editor | editor | editor123 |

## Estructura del Proyecto

```
├── frontend/          # SPA pública + Admin panel (React + Vite + Express server)
├── backend/           # API REST (Node.js + Express + Prisma)
├── docker-compose.yml # Desarrollo local
└── render.yaml        # Config alternativa para Render
```

## API Endpoints

### Público
- `GET /api/v1/events` — Lista de eventos
- `GET /api/v1/events/:slug` — Detalle de evento
- `GET /api/v1/posts` — Lista de artículos
- `GET /api/v1/posts/:slug` — Artículo completo
- `GET /api/v1/social/configs` — Config de redes sociales
- `GET /api/v1/site/settings` — Configuración del sitio
- `GET /api/v1/site/menu/:location` — Menús (header/footer)
- `GET /api/v1/site/content` — Contenido por sección
- `GET /api/v1/site/services` — Horarios de servicios

### Admin (requiere auth)
- `POST /api/v1/auth/login` — Login
- `GET /api/v1/auth/me` — Perfil actual
- `CRUD /api/v1/admin/events` — Gestión de eventos
- `CRUD /api/v1/admin/posts` — Gestión de artículos
- `CRUD /api/v1/admin/media` — Biblioteca de imágenes (Cloudinary)
- `CRUD /api/v1/social/admin/configs` — Gestión de redes sociales
- `PUT /api/v1/social/admin/configs` — Guarda redes sociales activas, orden y visibilidad en lote
- `CRUD /api/v1/site/settings` — Gestión de configuración
- `CRUD /api/v1/site/menu` — Gestión de menús
- `PUT /api/v1/site/menu/batch` — Guarda en una transacción el orden y visibilidad del menú superior
- `CRUD /api/v1/site/content` — Gestión de contenido
- `PUT /api/v1/site/pages/:pageKey` — Guarda en una transacción el contenido de una página
- `CRUD /api/v1/site/services` — Gestión de servicios

## Integración Social

### Open Graph
Cada página incluye meta tags OG para previews bonitos en redes sociales.

### Píxeles de Seguimiento
Configurables vía `.env`:
- Meta Pixel (Facebook/Instagram)
- TikTok Pixel
- Google Tag Manager

### Botones de Compartir
Cada artículo del blog incluye botones para compartir en Facebook, X y WhatsApp.

## Licencia

Propiedad del Ministerio Cristiano REDES.
