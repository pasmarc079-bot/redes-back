import { useEffect, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';
import { showConfirm } from '@/admin/components/ui/ConfirmModal';
import { showToast } from '@/admin/components/ui/Toast';
import { siteApi } from '@/services/api';
import { fromTimeInputValue, toTimeInputValue, WEEKDAYS } from '@/utils/serviceSchedule';
import type { ServiceSchedule } from '@/types';

type DraftService = ServiceSchedule & { isNew?: boolean };

const emptyService = (order: number): DraftService => ({
  id: `new-${Date.now().toString(36)}`,
  name: '',
  dayOfWeek: '',
  time: '',
  description: '',
  order,
  isActive: true,
  isNew: true,
});

/**
 * The same list feeds two places: "Nuestros Servicios" on the Nosotros page and "Reuniones" in the
 * footer. Editing here changes both, which is why the panel says so.
 */
export default function ServicesSettings() {
  const [services, setServices] = useState<DraftService[]>([]);
  const [saved, setSaved] = useState<DraftService[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    siteApi.getServicesAll()
      .then((res) => {
        const ordered = res.data as ServiceSchedule[];
        setServices(ordered);
        setSaved(ordered);
        setRemovedIds([]);
      })
      .catch(() => showToast('error', 'No se pudieron cargar los horarios.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const dirty = JSON.stringify(services) !== JSON.stringify(saved) || removedIds.length > 0;

  const update = (index: number, patch: Partial<DraftService>) => {
    setServices((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= services.length) return;
    setServices((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, itemIndex) => ({ ...item, order: itemIndex + 1 }));
    });
  };

  const remove = async (index: number) => {
    const service = services[index];
    const confirmed = await showConfirm({
      title: 'Quitar horario',
      message: `Se quitará "${service.name || service.dayOfWeek || 'este horario'}" de Nuestros Servicios y del pie de página.`,
      confirmLabel: 'Quitar',
      danger: true,
    });
    if (!confirmed) return;
    if (!service.isNew) setRemovedIds((current) => [...current, service.id]);
    setServices((current) => current.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, order: itemIndex + 1 })));
  };

  const save = async () => {
    const invalid = services.find((service) => !service.dayOfWeek.trim() || !service.time.trim());
    if (invalid) {
      showToast('error', 'Cada horario necesita un día y una hora.');
      return;
    }

    setSaving(true);
    try {
      for (const service of services) {
        const payload = {
          name: service.name.trim() || service.dayOfWeek.trim(),
          dayOfWeek: service.dayOfWeek.trim(),
          time: service.time.trim(),
          description: service.description?.trim() || null,
          order: service.order,
          isActive: service.isActive,
        };
        if (service.isNew) await siteApi.createService(payload);
        else await siteApi.updateService(service.id, payload);
      }
      for (const id of removedIds) await siteApi.deleteService(id);
      showToast('success', 'Horarios guardados. Ya se ven en Nosotros y en el pie de página.');
      load();
    } catch {
      showToast('error', 'No se pudieron guardar todos los horarios. Revisa la lista y vuelve a intentar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-16 text-center text-sm text-gray-500">Cargando horarios...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-heading text-2xl font-semibold text-gray-800">Horarios de servicios y reuniones</h3>
        <p className="mt-1 max-w-3xl text-sm text-gray-500">
          Esta lista es la misma que se ve en “Nuestros Servicios” (Nosotros) y en “Reuniones” (pie de página del sitio).
          Si cambias un horario aquí, cambia en los dos lugares.
        </p>
      </div>

      <section className="card card-body border-gold/30 bg-gold/5" aria-labelledby="services-guide-heading">
        <h4 id="services-guide-heading" className="font-heading text-lg font-semibold text-gray-800">Cómo se muestran</h4>
        <ul className="mt-3 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 font-heading text-gold-dark">1</span>
            <span><strong className="font-semibold">Día y hora</strong> aparecen en el pie de página, en una línea por reunión.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 font-heading text-gold-dark">2</span>
            <span><strong className="font-semibold">Nombre y descripción</strong> acompañan al horario en la página Nosotros.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 font-heading text-gold-dark">3</span>
            <span><strong className="font-semibold">Desmarcar “Activo”</strong> oculta el horario del sitio sin borrarlo.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 font-heading text-gold-dark">4</span>
            <span><strong className="font-semibold">Orden.</strong> Con las flechas decides cuál se ve primero.</span>
          </li>
        </ul>
      </section>

      <section className="card card-body">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="font-heading text-lg font-semibold text-gray-800">Reuniones de la semana</h4>
            <p className="mt-1 text-sm text-gray-500">{services.length} {services.length === 1 ? 'horario' : 'horarios'} en la lista.</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => setServices((current) => [...current, emptyService(current.length + 1)])} disabled={saving}>
            <FiPlus aria-hidden="true" /> Agregar horario
          </button>
        </div>

        {services.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">Agrega el primer horario para mostrarlo en el sitio.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {services.map((service, index) => (
              <li key={service.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[auto_1fr_150px_150px_auto]">
                  <div className="flex flex-col">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0 || saving} className="min-h-9 min-w-9 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30" aria-label={`Subir ${service.dayOfWeek || 'horario'}`}><FiArrowUp aria-hidden="true" /></button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === services.length - 1 || saving} className="min-h-9 min-w-9 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30" aria-label={`Bajar ${service.dayOfWeek || 'horario'}`}><FiArrowDown aria-hidden="true" /></button>
                  </div>

                  <div>
                    <label className="label" htmlFor={`service-name-${index}`}>Nombre del servicio <span className="font-normal text-gray-400">(opcional)</span></label>
                    <input id={`service-name-${index}`} type="text" maxLength={100} className="input w-full" value={service.name} onChange={(event) => update(index, { name: event.target.value })} placeholder="Servicio Dominical" />
                  </div>

                  <div>
                    <label className="label" htmlFor={`service-day-${index}`}>Día *</label>
                    <select
                      id={`service-day-${index}`}
                      className="input w-full"
                      value={service.dayOfWeek}
                      onChange={(event) => update(index, { dayOfWeek: event.target.value })}
                    >
                      <option value="">Elige un día</option>
                      {(WEEKDAYS.includes(service.dayOfWeek as (typeof WEEKDAYS)[number])
                        ? [...WEEKDAYS]
                        : service.dayOfWeek
                          ? [service.dayOfWeek, ...WEEKDAYS]
                          : [...WEEKDAYS]
                      ).map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label" htmlFor={`service-time-${index}`}>Hora *</label>
                    <input
                      id={`service-time-${index}`}
                      type="time"
                      step={300}
                      className="input w-full"
                      value={toTimeInputValue(service.time)}
                      onChange={(event) => update(index, { time: event.target.value ? fromTimeInputValue(event.target.value) : '' })}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {service.time ? `Se verá: ${service.time}` : 'Elige la hora.'}
                    </p>
                  </div>

                  <button type="button" onClick={() => remove(index)} disabled={saving} className="icon-btn text-red-400 hover:bg-red-50 hover:text-red-600" aria-label={`Quitar ${service.dayOfWeek || 'horario'}`}>
                    <FiTrash2 aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_auto]">
                  <div>
                    <label className="label" htmlFor={`service-description-${index}`}>Descripción corta <span className="font-normal text-gray-400">(opcional, se ve en Nosotros)</span></label>
                    <input id={`service-description-${index}`} type="text" maxLength={300} className="input w-full" value={service.description || ''} onChange={(event) => update(index, { description: event.target.value })} placeholder="Celebración familiar con música y predicación" />
                  </div>
                  <label className="flex min-h-11 items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={service.isActive} onChange={(event) => update(index, { isActive: event.target.checked })} className="rounded border-gray-300 text-gold focus:ring-gold/20" />
                    Activo
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-sm ${dirty ? 'text-amber-700' : 'text-gray-500'}`}>
            {dirty ? 'Tienes cambios sin guardar.' : 'Los cambios ya están guardados y visibles en el sitio.'}
          </p>
          <div className="flex gap-3">
            <button type="button" className="btn btn-secondary" onClick={load} disabled={saving || !dirty}>Descartar</button>
            <button type="button" className="btn btn-primary" onClick={save} disabled={saving || !dirty}>
              <FiSave aria-hidden="true" /> {saving ? 'Guardando...' : 'Guardar horarios'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
