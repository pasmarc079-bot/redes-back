import { useEffect, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';
import { showConfirm } from '@/admin/components/ui/ConfirmModal';
import { showToast } from '@/admin/components/ui/Toast';
import { siteApi } from '@/services/api';
import { MAX_SITE_METRICS, parseSiteMetrics, type SiteMetric } from '@/utils/siteMetrics';

const emptyMetric = (): SiteMetric => ({
  id: `metric-${Date.now().toString(36)}`,
  value: 0,
  suffix: '+',
  label: '',
});

/**
 * Numbers shown on the home page between "Nuestra Iglesia" and the testimonies.
 * They are stored as JSON in the site settings and animate from zero when the visitor reaches them.
 */
export default function MetricsSettings() {
  const [metrics, setMetrics] = useState<SiteMetric[]>([]);
  const [saved, setSaved] = useState<SiteMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    siteApi.getSettingsFull()
      .then((res) => {
        const parsed = parseSiteMetrics(res.data.find((item: { key: string }) => item.key === 'metrics_items')?.value);
        setMetrics(parsed);
        setSaved(parsed);
      })
      .catch(() => showToast('error', 'No se pudieron cargar las métricas.'))
      .finally(() => setLoading(false));
  }, []);

  const dirty = JSON.stringify(metrics) !== JSON.stringify(saved);

  const update = (index: number, patch: Partial<SiteMetric>) => {
    setMetrics((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= metrics.length) return;
    setMetrics((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = async (index: number) => {
    const metric = metrics[index];
    const confirmed = await showConfirm({
      title: 'Quitar métrica',
      message: `Se quitará "${metric.label || 'esta métrica'}" del inicio. Puedes volver a agregarla después.`,
      confirmLabel: 'Quitar',
      danger: true,
    });
    if (!confirmed) return;
    setMetrics((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const save = async () => {
    const found: Record<string, string> = {};
    metrics.forEach((metric, index) => {
      if (metric.label.trim().length < 2) found[`label-${index}`] = 'Cada métrica necesita una etiqueta.';
      if (!Number.isFinite(metric.value) || metric.value < 0) found[`value-${index}`] = 'Usa un número igual o mayor que cero.';
    });
    setErrors(found);
    if (Object.keys(found).length > 0) {
      showToast('error', Object.values(found)[0]);
      return;
    }

    setSaving(true);
    try {
      await siteApi.updateSettings({ metrics_items: JSON.stringify(metrics) });
      setSaved(metrics);
      showToast('success', 'Métricas guardadas. Ya se ven en el inicio.');
    } catch {
      showToast('error', 'No se pudieron guardar las métricas. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-16 text-center text-sm text-gray-500">Cargando métricas...</div>;

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
            <span><strong className="font-semibold">Orden.</strong> Usa las flechas para decidir cuál se ve primero. Puedes mostrar hasta {MAX_SITE_METRICS}.</span>
          </li>
        </ul>
      </section>

      <section className="card card-body">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="font-heading text-lg font-semibold text-gray-800">Números que se muestran</h4>
            <p className="mt-1 text-sm text-gray-500">
              {metrics.length === 0
                ? 'No hay métricas propias: el inicio muestra las cifras iniciales (10, 500, 100 y 200).'
                : `${metrics.length} de ${MAX_SITE_METRICS}.`}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setMetrics((current) => [...current, emptyMetric()])}
            disabled={metrics.length >= MAX_SITE_METRICS || saving}
          >
            <FiPlus aria-hidden="true" /> Agregar métrica
          </button>
        </div>

        {metrics.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">Agrega la primera métrica para empezar.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {metrics.map((metric, index) => (
              <li key={metric.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[auto_130px_110px_1fr_auto]">
                  <div className="flex flex-col">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0 || saving} className="min-h-9 min-w-9 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30" aria-label={`Subir métrica ${metric.label || index + 1}`}><FiArrowUp aria-hidden="true" /></button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === metrics.length - 1 || saving} className="min-h-9 min-w-9 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30" aria-label={`Bajar métrica ${metric.label || index + 1}`}><FiArrowDown aria-hidden="true" /></button>
                  </div>

                  <div>
                    <label className="label" htmlFor={`metric-value-${index}`}>Número</label>
                    <input
                      id={`metric-value-${index}`}
                      type="number"
                      min={0}
                      max={1000000}
                      step={1}
                      className={`input w-full ${errors[`value-${index}`] ? 'input-error' : ''}`}
                      value={Number.isFinite(metric.value) ? metric.value : ''}
                      onChange={(event) => update(index, { value: Number(event.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor={`metric-suffix-${index}`}>Sufijo</label>
                    <input
                      id={`metric-suffix-${index}`}
                      type="text"
                      maxLength={10}
                      className="input w-full"
                      value={metric.suffix}
                      onChange={(event) => update(index, { suffix: event.target.value })}
                      placeholder="+"
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor={`metric-label-${index}`}>Etiqueta</label>
                    <input
                      id={`metric-label-${index}`}
                      type="text"
                      maxLength={60}
                      className={`input w-full ${errors[`label-${index}`] ? 'input-error' : ''}`}
                      value={metric.label}
                      onChange={(event) => update(index, { label: event.target.value })}
                      placeholder="Eventos realizados"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={saving}
                    className="icon-btn text-red-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Quitar métrica ${metric.label || index + 1}`}
                  >
                    <FiTrash2 aria-hidden="true" />
                  </button>
                </div>

                <p className="mt-3 text-sm text-gray-500">
                  Se verá como: <span className="font-heading font-semibold text-gray-800">{metric.value.toLocaleString('es-EC')}{metric.suffix}</span>
                  {metric.label && <span> · {metric.label}</span>}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-sm ${dirty ? 'text-amber-700' : 'text-gray-500'}`}>
            {dirty ? 'Tienes cambios sin guardar.' : 'Los cambios ya están guardados y visibles en el inicio.'}
          </p>
          <div className="flex gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setMetrics(saved)} disabled={saving || !dirty}>Descartar</button>
            <button type="button" className="btn btn-primary" onClick={save} disabled={saving || !dirty}>
              <FiSave aria-hidden="true" /> {saving ? 'Guardando...' : 'Guardar métricas'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
