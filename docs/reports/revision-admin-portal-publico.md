# Revisión: Panel Admin y Portal Público — Ministerio REDES

> **Fecha:** Octubre 2026
> **Alcance:** arquitectura, relación admin → portal público, análisis de `GUIA_USUARIO_ADMIN.pdf` y discrepancias con el código.
> **Nota:** el PDF no se pudo leer como adjunto; se extrajo su texto con `pdftotext`. El contenido (38 páginas, generado con WeasyPrint) coincide con `GUIA_USUARIO_ADMIN.md`, que es su fuente.

---

## 1. Arquitectura general

Un solo frontend React/Vite con dos experiencias montadas por rutas:

- **Portal público** en `/` bajo `Layout` (`frontend/src/App.tsx:30-40`).
- **Panel admin** en `/admin/*`, lazy y fuera del layout público (`App.tsx:14-27`), con `AuthGuard` y rutas propias (`frontend/src/admin/App.tsx:25-54`).
- **Backend Express único**: los mismos routers sirven público y admin, protegidos por middleware por ruta (`backend/src/index.ts:46-56`).
- **PostgreSQL/Prisma** como fuente única de verdad e **Cloudinary** para imágenes.

---

## 2. Cómo se relacionan admin y portal público

El admin solo **escribe**; el público solo **lee** de la misma base de datos.

| Contenido | Admin (escritura) | BD | Portal público (lectura) | Dónde aparece |
|---|---|---|---|---|
| Eventos | `EventForm` → `POST/PUT /admin/events` | `Event` | `GET /events`, `GET /events/:slug` | Home, Eventos, detalle |
| Blog | `PostEditor` → `/posts` + `/publish` | `BlogPost` + versiones + tags | `GET /posts`, `/posts/:slug` | Blog, artículo |
| Media | `MediaLibrary` → `/admin/media/upload` | Cloudinary + `Media` | URLs guardadas en flyer/portada/settings | Todas las secciones |
| Páginas | `Settings.savePage` → `PUT /site/pages/:pageKey` | `SiteSetting` + `PageContent` | `GET /site/settings` + `/site/content` vía `siteStore` | Hero, Nosotros, etc. |
| Menú | `PUT /site/menu/batch` | `MenuItem` | `GET /site/menu/header` | Navbar |
| Redes | `socialApi.updateBatch` | `SocialConfig` | `GET /social/configs` | Home, Comunidad, Footer |
| Servicios | CRUD `/site/services` | `ServiceSchedule` | `GET /site/services` | Comunidad/Contacto |

**Punto clave:** el público carga todo una sola vez al montar `Layout` (`frontend/src/components/layout/Layout.tsx:12-21` → `frontend/src/stores/siteStore.ts:29-57`). Por eso los cambios del admin se ven al **recargar**, no literalmente “al instante” como afirma la guía.

---

## 3. Análisis de la guía

### Fortalezas

- Bien orientada a tareas, con ejemplos completos.
- Tabla de estados, solución de problemas y capturas reales (`admin_screenshots/`).
- Útil para un usuario no técnico.

### Defectos de documentación

- **Secciones duplicadas en el blog:** el ejemplo “Crear artículo”, “Añadir imágenes”, “Etiquetas” y “Editor BlockNote” aparecen dos veces (`GUIA_USUARIO_ADMIN.md` líneas 262-309 y 311-358). El PDF lo reproduce.
- **Credenciales reales publicadas** (usuario/contraseña de admin y editor, líneas 62-65, 76-88, 596). Riesgo de seguridad alto en un PDF distribuible.
- Varias afirmaciones no coinciden con el código (ver sección 4).

---

## 4. Discrepancias guía ↔ código (priorizadas)

### Altas

1. **El rol Editor no puede gestionar eventos.** La guía dice que sí (líneas 65, 88), pero el backend exige `ADMIN` o `EVENT_MANAGER` (`backend/src/routes/event.routes.ts:60,69`) y el seed solo le da `EDITOR` (`backend/prisma/seed.ts:52`) → recibiría 403.
2. **Borradores accesibles por URL directa.** `getPostBySlug` no filtra estado (`backend/src/services/blog.service.ts:45-52`) y `getEventBySlug` tampoco (`backend/src/services/event.service.ts:101-116`). Un artículo en borrador o un evento cancelado se ve en `/blog/:slug` o `/eventos/:slug`.
3. **El estado “Borrador” de eventos no existe en la práctica.** El formulario envía `DRAFT` por defecto (`frontend/src/admin/pages/events/EventForm.tsx:24`), pero el backend lo sobrescribe con el estado automático salvo `CANCELLED` (`event.service.ts:141-143,166-168`). No hay control de estado en la UI (`EventForm.tsx:213-220`). La guía pide “verificar que no esté en Borrador” (línea 648), algo imposible.

### Medias

4. **La etiqueta de Media es obligatoria**, no opcional (`backend/src/routes/media.routes.ts:36-39`), y **no se permite SVG** (`media.routes.ts:20`), aunque la guía dice lo contrario (líneas 406-409).
5. **Eliminar evento no borra el flyer de Cloudinary** (`event.service.ts:176-183`); la guía afirma que sí (línea 205).
6. **Versiones del blog:** guardar repetidamente un borrador actualiza la misma versión, no crea v2/v3 en cada guardado (`blog.service.ts:73-79`).
7. **Estado “En curso”:** el código marca el evento como `ONGOING` todo el día ecuatoriano, incluso antes de la hora de inicio (`event.service.ts:44-45`); la guía dice “entre inicio y fin”.
8. **Colores de estado invertidos:** el público usa `UPCOMING` azul y `ONGOING` verde (`frontend/src/pages/Events.tsx:18-22`); la guía dice próximo verde y en curso azul.
9. **La UI no distingue roles:** `AuthGuard` solo valida sesión (`frontend/src/admin/guards/AuthGuard.tsx:4-12`) y el sidebar muestra todo (`frontend/src/admin/components/layout/AdminLayout.tsx:6-13`), así que un editor ve Eventos/Configuración/Sistema aunque el backend le devuelva 403.

### Bajas

10. El endpoint público `/site/settings` devuelve **todas** las filas de configuración (`backend/src/routes/site.routes.ts:7-12`); hoy son datos de contacto, pero no debería usarse para secretos.
11. La afirmación de backups diarios (línea 693) no es verificable desde el repo.

---

## 5. Plan de trabajo propuesto

1. **Corregir la guía:** eliminar duplicados, quitar credenciales, ajustar permisos del editor, etiqueta obligatoria, formatos permitidos, borrado de flyer, semántica de versiones y “recargar” en vez de “al instante”.
2. **Cerrar huecos de seguridad:** filtrar `PUBLISHED` en `getPostBySlug` y excluir `CANCELLED/DRAFT` en `getEventBySlug`; rotar credenciales; ocultar secciones del admin según rol.
3. **Decidir el modelo de eventos:** implementar de verdad el borrador (toggle publicar + corregir el filtro sobre estado persistido) o eliminarlo de la guía y de la UI.
4. **Alinear detalles:** colores de estado, estado “hoy”, borrado de assets en Cloudinary.
