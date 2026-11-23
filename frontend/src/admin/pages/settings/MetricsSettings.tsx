import { useEffect, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiEdit3, FiPlus, FiTrash2 } from 'react-icons/fi';
import { showConfirm } from '@/admin/components/ui/ConfirmModal';
import EditorModal from '@/admin/components/ui/EditorModal';
import { showToast } from '@/admin/components/ui/Toast';
import { siteApi } from '@/services/api';
import {
  MAX_SITE_METRICS,
  formatMetricNumber,
  parseSiteMetrics,
  type SiteMetric,
} from '@/utils/siteMetrics';

const newMetricId = () => `metric-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

const apiError = (error: any, fallback: string) => error?.response?.data?.error || fallback;

interface EditorState {
  /** null cuando la métrica es nueva; si no, su posición en la lista. */
  index: number | null;
  draft: SiteMetric;
}

interface EditorErrors {
  value?: string;
  label?: string;
}

/** What the counter will look like on the home page. */
const MetricPreview = ({ metric }: { metric: SiteMetric }) => (
  <div className="rounded-xl bg-gray-50 px-5 py-5 text-center">
    <p className="font-display text-5xl leading-none tracking-wider text-gold-dark">
      {formatMetricNumber(Number.isFinite(metric.value) ? metric.value : 0)}{metric.suffix}
    </p>
    <p className="mt-2 font-heading text-[11px] uppercase tracking-[0.18em] text-gray-500">
      {metric.label.trim() || 'Etiqueta del número'}
    </p>
  </div>
);

/**
 * Numbers shown on the home page between "Nuestra Iglesia" and the testimonies.
 * Every change is saved right away, so the table never leaves a hidden pending state.
 */
export default function MetricsSettings() {
  const [metrics, setMetrics] = useState<SiteMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [errors, setErrors] = useState<EditorErrors>({});
  const [limitNotice, setLimitNotice] = useState('');

  useEffect(() => {
    siteApi.getSettingsFull()
      .then((res) => {
        const parsed = parseSiteMetrics(res.data.find((item: { key: string }) => item.key === 'metrics_items')?.value);
        setMetrics(parsed);
      })
      .catch(() => showToast('error', 'No se pudieron cargar las métricas.'))
      .finally(() => setLoading(false));
  }, []);

  const atLimit = metrics.length >= MAX_SITE_METRICS;

  const persist = async (next: SiteMetric[], message: string) => {
    setSaving(true);
    try {
      await siteApi.updateSettings({ metrics_items: JSON.stringify(next) });
      setMetrics(next);
      showToast('success', message);
      return true;
    } catch (error) {
      showToast('error', apiError(error, 'No se pudieron guardar las métricas. Intenta de nuevo.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => {
    if (atLimit) {
      setLimitNotice(
        `El inicio muestra hasta ${MAX_SITE_METRICS} números, en dos filas de cuatro. Para agregar otro, quita una métrica de la tabla.`,
      );
      return;
    }
    setLimitNotice('');
    setErrors({});
    setEditor({ index: null, draft: { id: newMetricId(), value: 0, suffix: '+', label: '' } });
  };

  const openEdit = (index: number) => {
    setErrors({});
    setEditor({ index, draft: { ...metrics[index] } });
  };

  const closeEditor = () => {
    setEditor(null);
    setErrors({});
  };

  const updateDraft = (patch: Partial<SiteMetric>) => {
    setEditor((current) => current && { ...current, draft: { ...current.draft, ...patch } });
  };

  const saveEditor = async () => {
    if (!editor || saving) return;

    const draft = editor.draft;
    const found: EditorErrors = {};
    if (!Number.isFinite(draft.value) || draft.value < 0) {
      found.value = 'Escribe el número con cifras, sin puntos ni comas.';
    } else if (draft.value > 1_000_000) {
      found.value = 'El número más grande que se puede mostrar es 1.000.000.';
    }
    if (draft.label.trim().length < 2) {
      found.label = 'Escribe la etiqueta que aparecerá debajo del número.';
    }
    setErrors(found);
    if (found.value || found.label) return;

    const clean: SiteMetric = {
      id: draft.id || newMetricId(),
      value: Math.round(draft.value),
      suffix: draft.suffix.trim(),
      label: draft.label.trim(),
    };
    const next = editor.index === null
      ? [...metrics, clean]
      : metrics.map((item, index) => (index === editor.index ? clean : item));

    const ok = await persist(
      next,
      editor.index === null ? 'Métrica agregada. Ya se ve en el inicio.' : 'Métrica actualizada.',
    );
    if (ok) setEditor(null);
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= metrics.length) return;
    const next = [...metrics];
    [next[index], next[target]] = [next[target], next[index]];
    await persist(next, 'Orden actualizado.');
  };

  const remove = async (index: number) => {
    const metric = metrics[index];
    const confirmed = await showConfirm({
      title: 'Quitar métrica',
      message: `Se quitará “${metric.label}” del inicio. Puedes volver a agregarla cuando quieras.`,
      confirmLabel: 'Quitar',
      danger: true,
    });
    if (!confirmed) return;
    setLimitNotice('');
    await persist(metrics.filter((_, itemIndex) => itemIndex !== index), 'Métrica quitada. Ya no se ve en el inicio.');
  };

  if (loading) return <div className="py-16 text-center text-sm text-gray-500">Cargando métricas...</div>;

  const rowActions = (metric: SiteMetric, index: number) => (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => move(index, -1)}
        disabled={index === 0 || saving}
        className="icon-btn text-gray-500 hover:bg-gray-200 disabled:opacity-30"
        aria-label={`Subir métrica ${index + 1}`}
        title="Subir"
      >
        <FiArrowUp aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => move(index, 1)}
        disabled={index === metrics.length - 1 || saving}
        className="icon-btn text-gray-500 hover:bg-gray-200 disabled:opacity-30"
        aria-label={`Bajar métrica ${index + 1}`}
        title="Bajar"
      >
        <FiArrowDown aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => openEdit(index)}
        disabled={saving}
        className="icon-btn text-gray-500 hover:bg-gold/10 hover:text-gold-dark"
        aria-label={`Editar métrica ${index + 1}: ${metric.label}`}
        title="Editar métrica"
      >
        <FiEdit3 aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => remove(index)}
        disabled={saving}
        className="icon-btn text-red-400 hover:bg-red-50 hover:text-red-600"
        aria-label={`Quitar métrica ${index + 1}: ${metric.label}`}
        title="Quitar métrica"
      >
        <FiTrash2 aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-heading text-2xl font-semibold text-gray-800">Métricas del inicio</h3>
        <p className="mt-1 max-w-3xl text-sm text-gray-500">
          Estos números aparecen en el inicio, justo debajo de “Nuestra Iglesia” y antes de “Lo que dice nuestra comunidad”.
          El número sube desde 0 hasta el valor que escribas cuando el visitante llega a esa parte de la página.
        </p>
      </div>

      <section className="card card-body border-gold/30 bg-gold/5" aria-labelledby="metrics-guide-heading">
        <h4 id="metrics-guide-heading" className="font-heading text-lg font-semibold text-gray-800">Cómo se leen</h4>
        <ul className="mt-3 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 font-heading text-gold-dark">1</span>
            <span><strong className="font-semibold">Número.</strong> Solo cifras, sin puntos ni comas. Ejemplo: <code className="rounded bg-white px-1 py-0.5 text-xs">500</code>.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 font-heading text-gold-dark">2</span>
            <span><strong className="font-semibold">Sufijo.</strong> Lo que va pegado al número. Casi siempre <code className="rounded bg-white px-1 py-0.5 text-xs">+</code>; déjalo vacío si no quieres nada.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 font-heading text-gold-dark">3</span>
            <span><strong className="font-semibold">Etiqueta.</strong> El texto debajo del número, en mayúsculas pequeñas. Ejemplo: “Eventos realizados”.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 font-heading text-gold-dark">4</span>
            <span><strong className="font-semibold">Orden y cantidad.</strong> Las flechas deciden cuál se ve primero. El inicio admite hasta {MAX_SITE_METRICS}, en dos filas de cuatro.</span>
          </li>
        </ul>
      </section>

      <section className="card card-body" aria-labelledby="metrics-list-heading">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 id="metrics-list-heading" className="font-heading text-lg font-semibold text-gray-800">Números que se muestran</h4>
            <p className="mt-1 text-sm text-gray-500">
              {metrics.length === 0
                ? 'Todavía no hay métricas propias: el inicio muestra las cifras iniciales (10+, 500+, 100+ y 200+).'
                : `${metrics.length} de ${MAX_SITE_METRICS}. Cada cambio se guarda al instante.`}
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={openNew} disabled={saving}>
            <FiPlus aria-hidden="true" /> Agregar métrica
          </button>
        </div>

        {limitNotice && (
          <p role="status" className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {limitNotice}
          </p>
        )}

        {metrics.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-500">Agrega la primera métrica para reemplazar las cifras iniciales.</p>
            <button type="button" className="btn btn-secondary mt-4" onClick={openNew}>
              <FiPlus aria-hidden="true" /> Agregar la primera métrica
            </button>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="mt-4 w-full border-collapse text-sm">
                <caption className="sr-only">
                  Números del inicio: orden, cifra, sufijo, etiqueta y acciones.
                </caption>
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th scope="col" className="w-32 py-2 pl-2">Número</th>
                    <th scope="col" className="w-20 py-2 pr-4">Sufijo</th>
                    <th scope="col" className="py-2 pr-4">Etiqueta</th>
                    <th scope="col" className="w-36 py-2 pr-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric, index) => (
                    <tr key={metric.id} className="border-b border-gray-100 align-middle last:border-0 hover:bg-gray-50/70">
                      <td className="py-2 pl-2">
                        <span className="font-display text-xl tracking-wider text-dark tabular-nums">
                          {formatMetricNumber(metric.value)}{metric.suffix}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        {metric.suffix
                          ? <span className="text-gray-700">{metric.suffix}</span>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-2 pr-4 text-gray-800">{metric.label}</td>
                      <td className="py-2 pr-2">{rowActions(metric, index)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-4 divide-y divide-gray-100 md:hidden">
              {metrics.map((metric, index) => (
                <li key={metric.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xl tracking-wider text-dark tabular-nums">
                      {formatMetricNumber(metric.value)}{metric.suffix}
                    </p>
                    <p className="truncate text-sm text-gray-600">{metric.label}</p>
                  </div>
                  {rowActions(metric, index)}
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="mt-6 border-t border-gray-100 pt-5 text-sm text-gray-500">
          {saving
            ? 'Guardando el cambio...'
            : 'Cada cambio se guarda al instante y ya se ve en el inicio al recargar la página.'}
        </p>
      </section>

      {editor && (
        <EditorModal
          open
          title={editor.index === null ? 'Agregar métrica' : 'Editar métrica'}
          subtitle={editor.index === null
            ? `Se sumará al final de la lista, como número ${metrics.length + 1} de ${MAX_SITE_METRICS}.`
            : `Número ${editor.index + 1} de ${metrics.length} en el inicio.`}
          onClose={closeEditor}
          note="Se guarda al instante."
          actions={(
            <>
              <button type="button" className="btn btn-secondary" onClick={closeEditor}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={saveEditor} disabled={saving}>
                {saving ? 'Guardando...' : editor.index === null ? 'Agregar métrica' : 'Guardar métrica'}
              </button>
            </>
          )}
        >
          <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); saveEditor(); }} noValidate>
            <MetricPreview metric={editor.draft} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="metric-value">Número</label>
                <input
                  id="metric-value"
                  type="number"
                  min={0}
                  max={1_000_000}
                  step={1}
                  inputMode="numeric"
                  className={`input w-full tabular-nums ${errors.value ? 'input-error' : ''}`}
                  value={Number.isFinite(editor.draft.value) ? editor.draft.value : ''}
                  onChange={(event) => updateDraft({ value: event.target.value === '' ? Number.NaN : Number(event.target.value) })}
                  aria-invalid={!!errors.value}
                  aria-describedby={errors.value ? 'metric-value-error' : 'metric-value-help'}
                  autoFocus
                />
                {errors.value
                  ? <p id="metric-value-error" className="mt-1 text-xs text-red-600">{errors.value}</p>
                  : <p id="metric-value-help" className="mt-1 text-xs text-gray-500">Solo cifras: 500, no 500.000.</p>}
              </div>

              <div>
                <label className="label" htmlFor="metric-suffix">
                  Sufijo <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <input
                  id="metric-suffix"
                  type="text"
                  maxLength={10}
                  className="input w-full"
                  value={editor.draft.suffix}
                  onChange={(event) => updateDraft({ suffix: event.target.value })}
                  placeholder="+"
                  aria-describedby="metric-suffix-help"
                />
                <p id="metric-suffix-help" className="mt-1 text-xs text-gray-500">Va pegado al número. Vacío: solo la cifra.</p>
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-3">
                <label className="label mb-0" htmlFor="metric-label">Etiqueta</label>
                <span className="text-xs tabular-nums text-gray-400">{editor.draft.label.length}/60</span>
              </div>
              <input
                id="metric-label"
                type="text"
                maxLength={60}
                className={`input mt-1.5 w-full ${errors.label ? 'input-error' : ''}`}
                value={editor.draft.label}
                onChange={(event) => updateDraft({ label: event.target.value })}
                placeholder="Eventos realizados"
                aria-invalid={!!errors.label}
                aria-describedby={errors.label ? 'metric-label-error' : 'metric-label-help'}
              />
              {errors.label
                ? <p id="metric-label-error" className="mt-1 text-xs text-red-600">{errors.label}</p>
                : <p id="metric-label-help" className="mt-1 text-xs text-gray-500">Se muestra debajo del número, en mayúsculas pequeñas.</p>}
            </div>
          </form>
        </EditorModal>
      )}
    </div>
  );
}
