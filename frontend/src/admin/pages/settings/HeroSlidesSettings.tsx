import { useEffect, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiEdit3, FiImage, FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import { showConfirm } from '@/admin/components/ui/ConfirmModal';
import MediaPicker from '@/admin/components/ui/MediaPicker';
import PageLinkField from '@/admin/components/ui/PageLinkField';
import { SITE_PAGES } from '@/config/sitePages';
import { showToast } from '@/admin/components/ui/Toast';
import { siteApi } from '@/services/api';
import { MAX_HERO_SLIDES, parseHeroSlides, parseIntervalSeconds, type HeroSlide } from '@/utils/heroSlides';

type ImageTarget = 'imageUrl' | 'mobileImageUrl';

const emptySlide = (): HeroSlide => ({
  id: `slide-${Date.now().toString(36)}`,
  eyebrow: '',
  title: '',
  subtitle: '',
  location: '',
  ctaLabel: '',
  ctaUrl: '',
  secondaryCtaLabel: '',
  secondaryCtaUrl: '',
  imageUrl: '',
  mobileImageUrl: '',
});

const TITLE_HELP = 'Escribe aquí el mensaje principal de la portada. Si quieres destacar una palabra, ponla entre asteriscos y se mostrará en dorado. Ejemplo: nos une *en familia*';

export default function HeroSlidesSettings() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [saved, setSaved] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [picker, setPicker] = useState<ImageTarget | null>(null);
  const [intervalSeconds, setIntervalSeconds] = useState(6);
  const [savingInterval, setSavingInterval] = useState(false);

  useEffect(() => {
    siteApi.getSettingsFull()
      .then((res) => {
        const parsed = parseHeroSlides(res.data.find((s: { key: string }) => s.key === 'hero_slides')?.value);
        setSlides(parsed);
        setSaved(parsed);
        setIntervalSeconds(parseIntervalSeconds(res.data.find((s: { key: string }) => s.key === 'hero_slides_interval')?.value));
      })
      .catch(() => showToast('error', 'No se pudo cargar la portada.'))
      .finally(() => setLoading(false));
  }, []);

  const dirty = JSON.stringify(slides) !== JSON.stringify(saved);

  const saveInterval = async () => {
    setSavingInterval(true);
    try {
      await siteApi.updateSettings({ hero_slides_interval: String(intervalSeconds) });
      showToast('success', 'Tiempo de rotación guardado.');
    } catch {
      showToast('error', 'No se pudo guardar el tiempo de rotación.');
    } finally {
      setSavingInterval(false);
    }
  };

  const persist = async (next: HeroSlide[]) => {
    setSaving(true);
    try {
      await siteApi.updateSettings({ hero_slides: JSON.stringify(next) });
      setSlides(next);
      setSaved(next);
      showToast('success', 'Portada guardada.');
      return true;
    } catch {
      showToast('error', 'No se pudo guardar la portada. Intenta de nuevo.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const destinationLabel = (url: string) => SITE_PAGES.find((page) => page.url === url)?.label ?? url;

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[index], next[target]] = [next[target], next[index]];
    setSlides(next);
  };

  const remove = async (index: number) => {
    const slide = slides[index];
    const confirmed = await showConfirm({
      title: 'Quitar mensaje',
      message: `Se quitará "${slide.title.replace(/\*/g, '')}" de la portada. La imagen se queda en la biblioteca de medios.`,
      confirmLabel: 'Quitar',
      danger: true,
    });
    if (!confirmed) return;
    await persist(slides.filter((_, i) => i !== index));
  };

  const openEditor = (slide: HeroSlide | null, index: number | null) => {
    setErrors({});
    setEditing(slide ?? emptySlide());
    setEditingIndex(index);
  };

  const validate = (slide: HeroSlide) => {
    const next: Record<string, string> = {};
    if (!slide.title.replace(/\*/g, '').trim()) next.title = 'Escribe el titular.';
    if (slide.ctaLabel && !slide.ctaUrl) next.ctaUrl = 'Agrega el enlace del botón o quita el texto del botón.';
    if (slide.ctaUrl && !slide.ctaLabel) next.ctaLabel = 'Escribe el texto del botón o quita el enlace.';
    if (slide.ctaUrl && !/^(\/(?!\/)|https?:\/\/)/i.test(slide.ctaUrl)) next.ctaUrl = 'Usa una ruta interna (ej. /eventos) o un enlace que empiece con https://';
    if (slide.secondaryCtaUrl && !slide.secondaryCtaLabel) next.secondaryCtaLabel = 'Escribe el texto del botón o quita el enlace.';
    if (slide.secondaryCtaLabel && !slide.secondaryCtaUrl) next.secondaryCtaUrl = 'Agrega el enlace del botón o quita el texto.';
    if (slide.secondaryCtaUrl && !/^(\/(?!\/)|https?:\/\/)/i.test(slide.secondaryCtaUrl)) next.secondaryCtaUrl = 'Usa una ruta interna (ej. /nosotros) o un enlace que empiece con https://';
    if (!slide.imageUrl && !slide.mobileImageUrl) next.imageUrl = 'Elige al menos una imagen.';
    return next;
  };

  const commitEditor = async () => {
    if (!editing) return;
    const found = validate(editing);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const next = editingIndex === null
      ? [...slides, editing]
      : slides.map((s, i) => (i === editingIndex ? editing : s));
    const ok = await persist(next);
    if (ok) setEditing(null);
  };

  if (loading) return <div className="py-16 text-center text-sm text-gray-500">Cargando portada...</div>;

  const atLimit = slides.length >= MAX_HERO_SLIDES;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-heading text-2xl font-semibold text-gray-800">Portada del inicio</h3>
        <p className="mt-1 max-w-3xl text-sm text-gray-500">
          Cada mensaje que agregues se mostrará en la portada del inicio, uno tras otro. Puedes agregar hasta {MAX_HERO_SLIDES}.
        </p>
      </div>

      <section className="card card-body" aria-labelledby="slides-heading">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 id="slides-heading" className="font-heading text-lg font-semibold text-gray-800">Mensajes de la portada</h4>
            <p className="mt-1 text-sm text-gray-500">
              {slides.length === 0
                ? 'Todavía no hay mensajes propios, así que la portada muestra el contenido de siempre.'
                : `${slides.length} de ${MAX_HERO_SLIDES}. El primero es el que ven los visitantes al entrar al sitio.`}
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => openEditor(null, null)} disabled={atLimit || saving}>
            <FiPlus /> Agregar mensaje
          </button>
        </div>

        {slides.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">Agrega el primer mensaje para empezar.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {slides.map((slide, index) => (
              <li key={slide.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:flex-row md:items-center">
                <div className="flex flex-col md:w-10">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0 || saving} className="min-h-9 min-w-9 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30" aria-label={`Subir mensaje ${index + 1}`}><FiArrowUp aria-hidden="true" /></button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === slides.length - 1 || saving} className="min-h-9 min-w-9 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30" aria-label={`Bajar mensaje ${index + 1}`}><FiArrowDown aria-hidden="true" /></button>
                </div>
                <div className="h-16 w-28 shrink-0 overflow-hidden rounded-md bg-dark">
                  {(slide.imageUrl || slide.mobileImageUrl) && <img src={slide.imageUrl || slide.mobileImageUrl} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Mensaje {index + 1}</p>
                  <p className="truncate font-heading font-semibold text-gray-800">{slide.title.replace(/\*/g, '')}</p>
                  <p className="truncate text-sm text-gray-500">
                    {slide.ctaLabel ? `Botón principal: ${slide.ctaLabel} → ${destinationLabel(slide.ctaUrl)}` : 'Sin botón principal'}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {slide.secondaryCtaLabel ? `Segundo botón: ${slide.secondaryCtaLabel} → ${destinationLabel(slide.secondaryCtaUrl)}` : 'Sin segundo botón'}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => openEditor(slide, index)} disabled={saving} className="btn btn-secondary whitespace-nowrap"><FiEdit3 aria-hidden="true" /> Editar</button>
                  <button type="button" onClick={() => remove(index)} disabled={saving} className="min-h-11 min-w-11 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600" aria-label={`Quitar mensaje ${index + 1}`}><FiTrash2 aria-hidden="true" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {dirty && (
          <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-amber-700">Cambiaste el orden. Guarda para que se vea en el sitio.</p>
            <div className="flex gap-3">
              <button type="button" className="btn btn-secondary" onClick={() => setSlides(saved)} disabled={saving}>Descartar</button>
              <button type="button" className="btn btn-primary" onClick={() => persist(slides)} disabled={saving}><FiSave aria-hidden="true" /> {saving ? 'Guardando...' : 'Guardar orden'}</button>
            </div>
          </div>
        )}
      </section>

      <section className="card card-body" aria-labelledby="rotation-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h4 id="rotation-heading" className="font-heading text-lg font-semibold text-gray-800">Cambio automático</h4>
            <p className="mt-1 text-sm text-gray-500">
              Cada cuántos segundos pasa la portada al siguiente mensaje. Con 0 los mensajes no cambian solos y el visitante avanza con los puntitos.
            </p>
          </div>
          <div className="flex items-end gap-3">
            <div className="w-28">
              <label className="label" htmlFor="hero-interval">Segundos</label>
              <input
                id="hero-interval"
                type="number"
                min={0}
                max={60}
                step={1}
                className="input w-full"
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(Math.max(0, Math.min(60, Number(e.target.value) || 0)))}
              />
            </div>
            <button type="button" className="btn btn-primary" onClick={saveInterval} disabled={savingInterval}>
              <FiSave aria-hidden="true" /> {savingInterval ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="hero-editor-title">
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-dark">Portada</p>
                <h4 id="hero-editor-title" className="mt-1 font-heading text-xl font-semibold text-gray-800">{editingIndex === null ? 'Nuevo mensaje' : `Editar mensaje ${editingIndex + 1}`}</h4>
              </div>
              <button type="button" onClick={() => setEditing(null)} className="min-h-11 min-w-11 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Cerrar editor"><FiX size={21} aria-hidden="true" /></button>
            </div>

            <form className="space-y-6 px-5 py-6 sm:px-7" onSubmit={(event) => { event.preventDefault(); commitEditor(); }} noValidate>
              {Object.keys(errors).length > 0 && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{Object.values(errors)[0]}</p>
              )}

              <fieldset className="space-y-4">
                <legend className="font-heading text-sm font-semibold uppercase tracking-wider text-gold-dark">Textos</legend>

                <div className="field-group">
                  <label className="label" htmlFor="hero-title">Mensaje principal</label>
                  <p className="mb-2 text-xs text-gray-500">{TITLE_HELP}</p>
                  <input id="hero-title" className={`input w-full uppercase ${errors.title ? 'input-error' : ''}`} maxLength={160} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} aria-invalid={!!errors.title} aria-describedby={errors.title ? 'hero-title-error' : undefined} />
                  {errors.title && <p id="hero-title-error" className="mt-1 text-xs text-red-600">{errors.title}</p>}
                </div>

                <div className="field-group">
                  <label className="label" htmlFor="hero-eyebrow">Encabezado pequeño <span className="font-normal text-gray-400">(opcional)</span></label>
                  <p className="mb-2 text-xs text-gray-500">Texto corto en dorado que aparece encima del mensaje principal. Ej: Nuestra familia</p>
                  <input id="hero-eyebrow" className="input w-full" maxLength={60} value={editing.eyebrow} onChange={(e) => setEditing({ ...editing, eyebrow: e.target.value })} />
                </div>

                <div className="field-group">
                  <label className="label" htmlFor="hero-subtitle">Texto explicativo <span className="font-normal text-gray-400">(opcional)</span></label>
                  <textarea id="hero-subtitle" className="textarea w-full" rows={3} maxLength={300} value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
                  <p className="mt-1 text-right text-xs text-gray-400">{editing.subtitle.length}/300</p>
                </div>

                <div className="field-group">
                  <label className="label" htmlFor="hero-location">Ciudad <span className="font-normal text-gray-400">(opcional)</span></label>
                  <input id="hero-location" className="input w-full" maxLength={80} value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Lago Agrio, Ecuador" />
                </div>
              </fieldset>

              <fieldset className="space-y-4 rounded-xl border border-gray-200 p-4">
                <legend className="px-1 font-heading text-sm font-semibold uppercase tracking-wider text-gold-dark">Botones</legend>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="field-group">
                    <label className="label" htmlFor="hero-cta-label">Texto del botón principal</label>
                    <input id="hero-cta-label" className={`input w-full ${errors.ctaLabel ? 'input-error' : ''}`} maxLength={40} value={editing.ctaLabel} onChange={(e) => setEditing({ ...editing, ctaLabel: e.target.value })} aria-invalid={!!errors.ctaLabel} placeholder="Ej. Ver los eventos" />
                    {errors.ctaLabel && <p className="mt-1 text-xs text-red-600">{errors.ctaLabel}</p>}
                  </div>
                  <PageLinkField
                    id="hero-cta-url"
                    label="A dónde lleva"
                    help="Elige la página del sitio a la que quieres enviar al visitante."
                    value={editing.ctaUrl}
                    onChange={(url) => setEditing({ ...editing, ctaUrl: url })}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 md:grid-cols-2">
                  <div className="field-group">
                    <label className="label" htmlFor="hero-cta2-label">Texto del segundo botón <span className="font-normal text-gray-400">(opcional)</span></label>
                    <input id="hero-cta2-label" className="input w-full" maxLength={40} value={editing.secondaryCtaLabel} onChange={(e) => setEditing({ ...editing, secondaryCtaLabel: e.target.value })} placeholder="Ej. Conócenos" />
                  </div>
                  <PageLinkField
                    id="hero-cta2-url"
                    label="A dónde lleva"
                    help="Déjalo vacío si no quieres el segundo botón."
                    value={editing.secondaryCtaUrl}
                    onChange={(url) => setEditing({ ...editing, secondaryCtaUrl: url })}
                  />
                </div>
              </fieldset>

              <fieldset className="space-y-4 rounded-xl border border-gray-200 p-4">
                <legend className="px-1 font-heading text-sm font-semibold uppercase tracking-wider text-gold-dark">Imágenes</legend>
                <p className="text-xs text-gray-500">La imagen de computadora se ve en pantallas grandes y la de celular en las pequeñas. Si solo eliges una, se usa en las dos.</p>
                {errors.imageUrl && <p className="text-xs text-red-600">{errors.imageUrl}</p>}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ImageField label="Computadora" value={editing.imageUrl} onPick={() => setPicker('imageUrl')} onClear={() => setEditing({ ...editing, imageUrl: '' })} />
                  <ImageField label="Celular" value={editing.mobileImageUrl} onPick={() => setPicker('mobileImageUrl')} onClear={() => setEditing({ ...editing, mobileImageUrl: '' })} />
                </div>
              </fieldset>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setEditing(null)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}><FiSave aria-hidden="true" /> {saving ? 'Guardando...' : 'Guardar mensaje'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        onSelect={(url) => {
          if (picker && editing) setEditing({ ...editing, [picker]: url });
          setPicker(null);
        }}
      />
    </div>
  );
}

function ImageField({ label, value, onPick, onClear }: { label: string; value: string; onPick: () => void; onClear: () => void }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-gray-400">Sin imagen</span>}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onPick} className="btn btn-secondary flex-1"><FiImage aria-hidden="true" /> {value ? 'Cambiar' : 'Elegir'}</button>
        {value && <button type="button" onClick={onClear} className="min-h-11 rounded-lg px-3 text-sm text-red-500 hover:bg-red-50">Quitar</button>}
      </div>
    </div>
  );
}
