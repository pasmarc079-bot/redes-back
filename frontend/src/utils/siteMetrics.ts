export interface SiteMetric {
  id: string;
  /** Number the counter animates up to. */
  value: number;
  /** Text drawn right after the number, e.g. "+". */
  suffix: string;
  label: string;
}

export const MAX_SITE_METRICS = 8;

/**
 * Shown on the home page until someone saves their own numbers in the admin, so the section is
 * never empty on a database that has not been configured yet.
 */
export const DEFAULT_SITE_METRICS: SiteMetric[] = [
  { id: 'metric-years', value: 10, suffix: '+', label: 'Años de trayectoria' },
  { id: 'metric-people', value: 500, suffix: '+', label: 'Personas alcanzadas' },
  { id: 'metric-events', value: 100, suffix: '+', label: 'Eventos realizados' },
  { id: 'metric-families', value: 200, suffix: '+', label: 'Familias participantes' },
];

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const count = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(1_000_000, Math.round(parsed));
};

/** Reads the metrics stored as JSON in the site settings, dropping anything incomplete. */
export function parseSiteMetrics(raw?: string | null): SiteMetric[] {
  if (raw === undefined || raw === null || raw.trim() === '') return DEFAULT_SITE_METRICS;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return DEFAULT_SITE_METRICS;
  }
  if (!Array.isArray(data)) return DEFAULT_SITE_METRICS;

  const metrics = data.slice(0, MAX_SITE_METRICS).flatMap((item, index): SiteMetric[] => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const label = text(record.label, 60);
    if (!label) return [];
    return [{
      id: text(record.id, 64) || `metric-${index}`,
      value: count(record.value),
      suffix: text(record.suffix, 10),
      label,
    }];
  });

  return metrics.length > 0 ? metrics : DEFAULT_SITE_METRICS;
}

/** Groups large numbers with the Ecuadorian dot separator: 1500 → 1.500. */
export const formatMetricNumber = (value: number) => new Intl.NumberFormat('es-EC').format(value);
