# Ministerio REDES - Sitio Web

Sitio web oficial del Ministerio Cristiano REDES de Lago Agrio, Ecuador.

## Stack

| Capa | Tecnología |
|------|-----------|
| **Frontend Público** | React + Vite + Tailwind CSS + Framer Motion |
| **Admin Panel** | React + Vite + Tailwind + TipTap (Rich Text) |
| **Backend API** | Node.js + Express + TypeScript + Prisma |
| **Base de Datos** | PostgreSQL 16 |
| **Imágenes** | Cloudinary (CDN global, optimización automática) |
| **Auth** | JWT + bcrypt |
| **Tests E2E** | Playwright |

## Identidad Visual

- **Colores:** Dorado (`#C9A84C`) + Negro (`#1A1A1A`) — basados en el logo oficial
- **Tipografías:** Montserrat (headings), Inter (body), Bebas Neue (display)
- **Tono:** Celebrativo, espiritual, familiar, accesible

## Redes Sociales

- **Facebook:** [@MinisterioREDESlive](https://www.facebook.com/MinisterioREDESlive) (3.9K seguidores)
- **YouTube:** [Canal oficial](https://youtube.com/channel/UClpoz4Olk2soO3Cg2gUKWKA)
- **TikTok:** Activo con transmisiones en vivo
- **WhatsApp:** 099 453 8859

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

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

### 4. Admin

```bash
cd admin
npm install
npm run dev
# http://localhost:5174
# Login: admin / admin123
```

## Despliegue en Seenode

Cada servicio se despliega de forma independiente como **Web Service** en Seenode:

| Servicio | Root Dir | Build Command | Start Command | Port |
|----------|----------|---------------|---------------|------|
| **Backend** | `backend` | `npm install && npx prisma generate && npm run build` | `npx prisma migrate deploy && npm start` | 8080 |
| **Frontend** | `frontend` | `npm install && npm run build` | `node server.cjs` | 8080 |
| **Admin** | `admin` | `npm install && npm run build` | `node server.cjs` | 8080 |

### Base de datos

Crear un **PostgreSQL managed** en Seenode y usar el connection string como `DATABASE_URL` en el backend.

### Guía completa

Ver [docs/deployment-seenode.md](docs/deployment-seenode.md) para instrucciones paso a paso.

## Credenciales por defecto

| Rol | Usuario | Contraseña |
|-----|---------|-----------|
| Admin | admin | admin123 |
| Editor | editor | editor123 |

## Estructura del Proyecto

```
├── frontend/          # SPA pública (React + Vite + Express server)
├── admin/             # Panel de administración (React + Vite + Express server)
├── backend/           # API REST (Node.js + Express + Prisma)
├── tests/             # Playwright E2E
├── docs/              # Documentación
├── docker-compose.yml # Desarrollo local
└── render.yaml        # Config alternativa para Render
```

## API Endpoints

### Público
- `GET /api/v1/events` — Lista de eventos
- `GET /api/v1/events/:slug` — Detalle de evento
- `GET /api/v1/posts` — Lista de artículos
- `GET /api/v1/posts/:slug` — Artículo completo
- `GET /api/v1/badges` — Lista de insignias
- `GET /api/v1/members` — Lista de miembros
- `GET /api/v1/social/configs` — Config de redes sociales

### Admin (requiere auth)
- `POST /api/v1/auth/login` — Login
- `GET /api/v1/auth/me` — Perfil actual
- `CRUD /api/v1/admin/events` — Gestión de eventos
- `CRUD /api/v1/admin/posts` — Gestión de artículos
- `CRUD /api/v1/admin/badges` — Gestión de insignias
- `POST /api/v1/admin/badges/:id/assign` — Asignar insignia
- `CRUD /api/v1/admin/media` — Biblioteca de imágenes (Cloudinary)

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
