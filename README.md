# Ministerio REDES — Backend API

API REST del Ministerio Cristiano REDES.

## Stack

- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT + bcrypt (auth)
- Cloudinary (imágenes)

## Desarrollo Local

```bash
# 1. Base de datos
docker compose up -d postgres

# 2. Backend
cd backend
npm install
cp .env.example .env   # configurar variables
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Endpoints

### Públicos
- `GET /api/v1/events`
- `GET /api/v1/events/:slug`
- `GET /api/v1/posts`
- `GET /api/v1/posts/:slug`
- `GET /api/v1/badges`
- `GET /api/v1/members`
- `GET /api/v1/social/configs`

### Admin (requiere JWT)
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- CRUD `/api/v1/admin/events`
- CRUD `/api/v1/admin/posts`
- CRUD `/api/v1/admin/badges`
- `POST /api/v1/admin/badges/:id/assign`
- CRUD `/api/v1/admin/media`

## Credenciales por defecto

| Rol  | Usuario | Contraseña |
|------|---------|-----------|
| Admin | admin  | admin123  |
