import { z } from 'zod';

export const MAX_HERO_SLIDES = 5;

interface SettingMeta {
  label: string;
  group: string;
  type: string;
  /** Longest text accepted. Only free-text settings have it; the cover ones are validated separately. */
  max?: number;
}

/**
 * The only site settings the admin can write through PUT /site/settings.
 * Unknown keys are rejected instead of being silently dropped or breaking the whole transaction.
 * The label/group/type are only used when a row does not exist yet; existing rows keep theirs.
 */
export const SITE_SETTING_META: Record<string, SettingMeta> = {
  hero_slides: { label: 'Diapositivas de la portada (JSON)', group: 'general', type: 'json' },
  hero_slides_interval: { label: 'Segundos entre mensajes de la portada', group: 'general', type: 'number' },
  phone: { label: 'Teléfono oficial', group: 'contact', type: 'text', max: 40 },
  phone_international: { label: 'Teléfono para enlaces (tel:)', group: 'contact', type: 'text', max: 40 },
  whatsapp_number: { label: 'WhatsApp oficial (wa.me)', group: 'contact', type: 'text', max: 40 },
  whatsapp_message: { label: 'Mensaje predeterminado de WhatsApp', group: 'contact', type: 'textarea', max: 400 },
  email: { label: 'Correo electrónico institucional', group: 'contact', type: 'email', max: 120 },
  address: { label: 'Dirección física completa', group: 'contact', type: 'textarea', max: 300 },
  google_maps_url: { label: 'Enlace de Google Maps', group: 'contact', type: 'url', max: 500 },
  google_review_url: { label: 'Enlace para dejar reseña en Google', group: 'contact', type: 'url', max: 500 },
  google_business_name: { label: 'Nombre del negocio en Google', group: 'contact', type: 'text', max: 160 },
  donation_url: { label: 'Enlace de donaciones', group: 'contact', type: 'url', max: 500 },
  external_form_url: { label: 'Formulario externo', group: 'contact', type: 'url', max: 500 },
};

const firstIssue = (error: z.ZodError) => error.issues[0]?.message ?? 'Datos no válidos';

/** Empty values mean "not set", so the field default applies instead of turning into a zero. */
const asNumber = (value: unknown) => (value === '' || value === null || value === undefined ? undefined : value);

const href = (max: number, label: string) =>
  z
    .string({ invalid_type_error: `${label} debe ser texto.` })
    .trim()
    .max(max, `${label} es demasiado largo.`)
    .refine((value) => value === '' || /^\/(?!\/)/.test(value) || /^https?:\/\//i.test(value), {
      message: `${label} debe ser una ruta interna (por ejemplo /eventos) o un enlace que empiece con https://`,
    })
    .default('');

const overlayOpacity = z.preprocess(
  asNumber,
  z.coerce
    .number({ invalid_type_error: 'La oscuridad de la imagen debe ser un número entre 0 y 100.' })
    .int('La oscuridad de la imagen debe ser un número entero entre 0 y 100.')
    .min(0, 'La oscuridad de la imagen debe estar entre 0 y 100.')
    .max(100, 'La oscuridad de la imagen debe estar entre 0 y 100.')
    // Slides saved before this option existed keep the original look.
    .default(100),
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
    overlayOpacity,
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

const secondsSchema = z.preprocess(
  asNumber,
  z.coerce
    .number({ invalid_type_error: 'El cambio automático debe ser un número de segundos.' })
    .int('El cambio automático debe ser un número entero de segundos.')
    .min(0, 'El cambio automático debe estar entre 0 y 60 segundos.')
    .max(60, 'El cambio automático debe estar entre 0 y 60 segundos.'),
);

const textSchemas = Object.fromEntries(
  Object.entries(SITE_SETTING_META)
    .filter(([, meta]) => meta.max !== undefined)
    .map(([key, meta]) => [
      key,
      z
        .string({ invalid_type_error: `${meta.label} debe ser texto.` })
        .trim()
        .max(meta.max!, `${meta.label} admite ${meta.max} caracteres.`),
    ]),
) as Record<string, z.ZodTypeAny>;

export interface SiteSettingsUpdateResult {
  values?: Record<string, string>;
  error?: string;
}

const fail = (error: string): SiteSettingsUpdateResult => ({ error });

/** Validates and normalises a PUT /site/settings payload before it reaches the database. */
export function parseSiteSettingsUpdate(body: unknown): SiteSettingsUpdateResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return fail('Los datos enviados no son válidos.');
  }

  const payload = body as Record<string, unknown>;
  const keys = Object.keys(payload);
  if (keys.length === 0) return fail('No hay cambios para guardar.');

  const unknownKey = keys.find((key) => !(key in SITE_SETTING_META));
  if (unknownKey) {
    return fail(`El ajuste "${unknownKey}" no se puede editar desde esta pantalla.`);
  }

  const values: Record<string, string> = {};

  if ('hero_slides' in payload) {
    const raw = payload.hero_slides;
    if (typeof raw !== 'string') {
      return fail('Los mensajes de la portada deben enviarse como texto JSON.');
    }

    let data: unknown;
    try {
      data = raw.trim() === '' ? [] : JSON.parse(raw);
    } catch {
      return fail('Los mensajes de la portada no tienen un formato válido. Abre la pestaña Portada y vuelve a guardar.');
    }

    const parsed = slidesSchema.safeParse(data);
    if (!parsed.success) return fail(firstIssue(parsed.error));
    // Stored normalised, so what the site reads is exactly what was validated here.
    values.hero_slides = JSON.stringify(parsed.data);
  }

  if ('hero_slides_interval' in payload) {
    const parsed = secondsSchema.safeParse(payload.hero_slides_interval);
    if (!parsed.success) return fail(firstIssue(parsed.error));
    values.hero_slides_interval = String(parsed.data);
  }

  for (const key of keys) {
    if (key === 'hero_slides' || key === 'hero_slides_interval') continue;
    const parsed = textSchemas[key].safeParse(payload[key]);
    if (!parsed.success) return fail(firstIssue(parsed.error));
    values[key] = parsed.data as string;
  }

  if (Object.keys(values).length === 0) return fail('No hay cambios para guardar.');
  return { values };
}
