import { z } from 'zod';

export const MAX_HERO_SLIDES = 5;
export const MAX_SITE_METRICS = 8;
export const MAX_GALLERY_IMAGES = 12;

const firstIssue = (error: z.ZodError) => error.issues[0]?.message ?? 'Datos no válidos';

/** Empty values mean "not set", so the field default applies instead of turning into a zero. */
const asNumber = (value: unknown) => (value === '' || value === null || value === undefined ? undefined : value);

/** Accepts an internal route or an absolute http(s) URL; everything else is rejected. */
const href = (max: number, label: string) =>
  z
    .string({ invalid_type_error: `${label} debe ser texto.` })
    .trim()
    .max(max, `${label} es demasiado largo.`)
    .refine((value) => value === '' || /^\/(?!\/)/.test(value) || /^https?:\/\//i.test(value), {
      message: `${label} debe ser una ruta interna (por ejemplo /eventos) o un enlace que empiece con https://`,
    })
    .default('');

/** Slider value: 0 leaves the photo untouched, 100 is the darkest veil. */
const overlayOpacity = (label: string, fallback: number) =>
  z.preprocess(
    asNumber,
    z.coerce
      .number({ invalid_type_error: `${label} debe ser un número entre 0 y 100.` })
      .int(`${label} debe ser un número entero entre 0 y 100.`)
      .min(0, `${label} debe estar entre 0 y 100.`)
      .max(100, `${label} debe estar entre 0 y 100.`)
      .default(fallback),
  );

const text = (max: number, label: string) =>
  z.string({ invalid_type_error: `${label} debe ser texto.` }).trim().max(max, `${label} admite ${max} caracteres.`);

const intervalSeconds = (label: string, max: number) =>
  z.preprocess(
    asNumber,
    z.coerce
      .number({ invalid_type_error: `${label} debe ser un número de segundos.` })
      .int(`${label} debe ser un número entero de segundos.`)
      .min(0, `${label} debe estar entre 0 y ${max} segundos.`)
      .max(max, `${label} debe estar entre 0 y ${max} segundos.`),
  );

const slideSchema = z
  .object({
    id: z.string().trim().max(64).optional(),
    eyebrow: z.string().trim().max(60, 'El encabezado pequeño admite 60 caracteres.').default(''),
    title: z
      .string({
        required_error: 'Cada mensaje necesita un titular.',
        invalid_type_error: 'Cada mensaje necesita un titular.',
      })
      .trim()
      .max(160, 'El mensaje principal admite 160 caracteres.')
      .refine((value) => value.replace(/\*/g, '').trim().length > 0, 'Cada mensaje necesita un titular.'),
    subtitle: z.string().trim().max(300, 'El texto explicativo admite 300 caracteres.').default(''),
    location: z.string().trim().max(80, 'La ciudad admite 80 caracteres.').default(''),
    ctaLabel: z.string().trim().max(40, 'El texto del botón principal admite 40 caracteres.').default(''),
    ctaUrl: href(500, 'El enlace del botón principal'),
    secondaryCtaLabel: z.string().trim().max(40, 'El texto del segundo botón admite 40 caracteres.').default(''),
    secondaryCtaUrl: href(500, 'El enlace del segundo botón'),
    imageUrl: href(1000, 'La imagen de computadora'),
    mobileImageUrl: href(1000, 'La imagen de celular'),
    // Slides saved before this option existed keep the original look.
    overlayOpacity: overlayOpacity('La oscuridad de la imagen', 100),
  })
  .superRefine((slide, ctx) => {
    if (!slide.imageUrl && !slide.mobileImageUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['imageUrl'],
        message: 'Cada mensaje necesita al menos una imagen.',
      });
    }
  });

const slidesSchema = z.array(slideSchema).max(MAX_HERO_SLIDES, `Puedes agregar hasta ${MAX_HERO_SLIDES} mensajes de portada.`);

const metricSchema = z.object({
  id: z.string().trim().max(64).optional(),
  value: z.coerce
    .number({ invalid_type_error: 'El número de cada métrica debe ser un valor numérico.' })
    .int('El número de cada métrica debe ser entero.')
    .min(0, 'El número de cada métrica no puede ser negativo.')
    .max(1_000_000, 'El número de cada métrica es demasiado grande.'),
  suffix: z.string().trim().max(10, 'El sufijo admite 10 caracteres.').default('+'),
  label: z
    .string({ required_error: 'Cada métrica necesita una etiqueta.', invalid_type_error: 'Cada métrica necesita una etiqueta.' })
    .trim()
    .min(2, 'Cada métrica necesita una etiqueta.')
    .max(60, 'La etiqueta de cada métrica admite 60 caracteres.'),
});

const metricsSchema = z.array(metricSchema).max(MAX_SITE_METRICS, `Puedes mostrar hasta ${MAX_SITE_METRICS} métricas.`);

const galleryImageSchema = z.object({
  id: z.string().trim().max(64).optional(),
  imageUrl: href(1000, 'La imagen de la galería').refine((value) => value !== '', 'Cada imagen necesita un archivo.'),
  alt: z.string().trim().max(120, 'El texto alternativo admite 120 caracteres.').default(''),
  caption: z.string().trim().max(160, 'El texto de la imagen admite 160 caracteres.').default(''),
});

const gallerySchema = z.array(galleryImageSchema).max(MAX_GALLERY_IMAGES, `Puedes subir hasta ${MAX_GALLERY_IMAGES} imágenes.`);

interface SettingDefinition {
  label: string;
  group: string;
  type: string;
  schema: z.ZodTypeAny;
}

/**
 * Every site setting the admin can write. The label/group/type are only used when a row does not
 * exist yet; existing rows keep theirs. Unknown keys are rejected instead of being silently dropped
 * or breaking the whole transaction.
 */
const definitions: Record<string, SettingDefinition> = {
  // Portada del inicio
  hero_slides: { label: 'Diapositivas de la portada (JSON)', group: 'general', type: 'json', schema: slidesSchema },
  hero_slides_interval: {
    label: 'Segundos entre mensajes de la portada',
    group: 'general',
    type: 'number',
    schema: intervalSeconds('El cambio automático', 60),
  },
  // Portadas de páginas (las que todavía no usan mensajes propios)
  hero_image_url: { label: 'Imagen de portada para computadores (versión anterior)', group: 'general', type: 'image', schema: href(1000, 'La imagen de computadora') },
  hero_image_mobile_url: { label: 'Imagen de portada para celulares (versión anterior)', group: 'general', type: 'image', schema: href(1000, 'La imagen de celular') },
  home_social_enabled: { label: 'Mostrar la sección Nuestras redes', group: 'general', type: 'boolean', schema: text(10, 'La opción de redes en inicio') },
  about_cover_image_url: { label: 'Portada de Nosotros para computadores', group: 'about', type: 'image', schema: href(1000, 'La portada de Nosotros') },
  about_cover_image_mobile_url: { label: 'Portada de Nosotros para celulares', group: 'about', type: 'image', schema: href(1000, 'La portada de Nosotros para celulares') },
  about_cover_overlay_opacity: { label: 'Oscuridad de la portada de Nosotros', group: 'about', type: 'number', schema: overlayOpacity('La oscuridad de la portada de Nosotros', 70) },
  church_history: { label: 'Historia del ministerio', group: 'about', type: 'textarea', schema: text(4000, 'La historia del ministerio') },
  mission: { label: 'Misión', group: 'about', type: 'textarea', schema: text(1500, 'La misión') },
  vision: { label: 'Visión', group: 'about', type: 'textarea', schema: text(1500, 'La visión') },
  purpose: { label: 'Propósito', group: 'about', type: 'textarea', schema: text(1500, 'El propósito') },
  pastor_photo_url: { label: 'Imagen del pastor', group: 'about', type: 'image', schema: href(1000, 'La imagen del pastor') },
  events_cover_image_url: { label: 'Portada de Eventos para computadores', group: 'events', type: 'image', schema: href(1000, 'La portada de Eventos') },
  events_cover_image_mobile_url: { label: 'Portada de Eventos para celulares', group: 'events', type: 'image', schema: href(1000, 'La portada de Eventos para celulares') },
  events_cover_overlay_opacity: { label: 'Oscuridad de la portada de Eventos', group: 'events', type: 'number', schema: overlayOpacity('La oscuridad de la portada de Eventos', 70) },
  blog_cover_image_url: { label: 'Portada del Blog para computadores', group: 'blog', type: 'image', schema: href(1000, 'La portada del Blog') },
  blog_cover_image_mobile_url: { label: 'Portada del Blog para celulares', group: 'blog', type: 'image', schema: href(1000, 'La portada del Blog para celulares') },
  blog_cover_overlay_opacity: { label: 'Oscuridad de la portada del Blog', group: 'blog', type: 'number', schema: overlayOpacity('La oscuridad de la portada del Blog', 70) },
  community_cover_image_url: { label: 'Portada de Comunidad para computadores', group: 'community', type: 'image', schema: href(1000, 'La portada de Comunidad') },
  community_cover_image_mobile_url: { label: 'Portada de Comunidad para celulares', group: 'community', type: 'image', schema: href(1000, 'La portada de Comunidad para celulares') },
  community_cover_overlay_opacity: { label: 'Oscuridad de la portada de Comunidad', group: 'community', type: 'number', schema: overlayOpacity('La oscuridad de la portada de Comunidad', 70) },
  contact_cover_image_url: { label: 'Portada de Contacto para computadores', group: 'contact', type: 'image', schema: href(1000, 'La portada de Contacto') },
  contact_cover_image_mobile_url: { label: 'Portada de Contacto para celulares', group: 'contact', type: 'image', schema: href(1000, 'La portada de Contacto para celulares') },
  contact_cover_overlay_opacity: { label: 'Oscuridad de la portada de Contacto', group: 'contact', type: 'number', schema: overlayOpacity('La oscuridad de la portada de Contacto', 70) },
  // Métricas del inicio
  metrics_items: { label: 'Métricas del inicio (JSON)', group: 'general', type: 'json', schema: metricsSchema },
  // Galería de la comunidad
  community_gallery: { label: 'Galería de la comunidad (JSON)', group: 'community', type: 'json', schema: gallerySchema },
  community_gallery_interval: {
    label: 'Segundos entre imágenes de la galería',
    group: 'community',
    type: 'number',
    schema: intervalSeconds('El cambio automático de la galería', 30),
  },
  // Contacto
  phone: { label: 'Teléfono oficial', group: 'contact', type: 'text', schema: text(40, 'El teléfono oficial') },
  phone_international: { label: 'Teléfono para enlaces (tel:)', group: 'contact', type: 'text', schema: text(40, 'El teléfono para enlaces') },
  whatsapp_number: { label: 'WhatsApp oficial (wa.me)', group: 'contact', type: 'text', schema: text(40, 'El WhatsApp oficial') },
  whatsapp_message: { label: 'Mensaje predeterminado de WhatsApp', group: 'contact', type: 'textarea', schema: text(400, 'El mensaje de WhatsApp') },
  email: { label: 'Correo electrónico institucional', group: 'contact', type: 'email', schema: text(120, 'El correo electrónico') },
  address: { label: 'Dirección física completa', group: 'contact', type: 'textarea', schema: text(300, 'La dirección') },
  google_maps_url: { label: 'Enlace de Google Maps', group: 'contact', type: 'url', schema: text(500, 'El enlace de Google Maps') },
  google_review_url: { label: 'Enlace para dejar reseña en Google', group: 'contact', type: 'url', schema: text(500, 'El enlace de reseñas') },
  google_business_name: { label: 'Nombre del negocio en Google', group: 'contact', type: 'text', schema: text(160, 'El nombre del negocio') },
  donation_url: { label: 'Enlace de donaciones', group: 'contact', type: 'url', schema: text(500, 'El enlace de donaciones') },
  external_form_url: { label: 'Formulario externo', group: 'contact', type: 'url', schema: text(500, 'El enlace del formulario') },
};

/** Label, group and type per setting key. Used when a setting row has to be created. */
export const SITE_SETTING_META: Record<string, Omit<SettingDefinition, 'schema'>> = Object.fromEntries(
  Object.entries(definitions).map(([key, { label, group, type }]) => [key, { label, group, type }]),
);

export interface SiteSettingsUpdateResult {
  values?: Record<string, string>;
  error?: string;
}

const fail = (error: string): SiteSettingsUpdateResult => ({ error });

/** Validates and normalises a settings payload before it reaches the database. */
export function parseSiteSettingsUpdate(body: unknown): SiteSettingsUpdateResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return fail('Los datos enviados no son válidos.');
  }

  const payload = body as Record<string, unknown>;
  const keys = Object.keys(payload);
  if (keys.length === 0) return fail('No hay cambios para guardar.');

  const unknownKey = keys.find((key) => !(key in definitions));
  if (unknownKey) {
    return fail(`El ajuste "${unknownKey}" no se puede editar desde esta pantalla.`);
  }

  const values: Record<string, string> = {};

  for (const key of keys) {
    const raw = payload[key];
    let parsed: unknown;

    if (definitions[key].type === 'json') {
      if (typeof raw !== 'string') return fail(`${definitions[key].label} debe enviarse como texto JSON.`);
      try {
        parsed = raw.trim() === '' ? [] : JSON.parse(raw);
      } catch {
        return fail(`${definitions[key].label} no tiene un formato válido. Abre la pestaña correspondiente y vuelve a guardar.`);
      }
    } else {
      // Multipart-free JSON only: numbers arrive as strings from the admin inputs.
      parsed = raw;
    }

    const result = definitions[key].schema.safeParse(parsed);
    if (!result.success) return fail(firstIssue(result.error));
    // Stored normalised, so what the site reads is exactly what was validated here.
    values[key] = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
  }

  return { values };
}
