import { useEffect, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiFolder, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';
import { showConfirm } from '@/admin/components/ui/ConfirmModal';
import MediaPicker from '@/admin/components/ui/MediaPicker';
import { showToast } from '@/admin/components/ui/Toast';
import { siteApi } from '@/services/api';
import {
  MAX_GALLERY_IMAGES,
  DEFAULT_GALLERY_INTERVAL_SECONDS,
  parseGalleryImages,
  parseGalleryInterval,
  type GalleryImage,
} from '@/utils/communityGallery';

const emptyImage = (): GalleryImage => ({
  id: `gallery-${Date.now().toString(36)}`,
  imageUrl: '',
  alt: '',
  caption: '',
});

/**
 * Photos of the community shown as an automatic carousel before "Nuestras redes", on the home page
 * and on Comunidad. The same component is used on both, so they always show the same photos.
 */
export default function GallerySettings() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [saved, setSaved] = useState<GalleryImage[]>([]);
  const [intervalSeconds, setIntervalSeconds] = useState(DEFAULT_GALLERY_INTERVAL_SECONDS);
  const [savedInterval, setSavedInterval] = useState(DEFAULT_GALLERY_INTERVAL_SECONDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  useEffect(() => {
    siteApi.getSettingsFull()
      .then((res) => {
        const value = (key: string) => res.data.find((item: { key: string }) => item.key === key)?.value;
        const parsedImages = parseGalleryImages(value('community_gallery'));
        const parsedInterval = parseGalleryInterval(value('community_gallery_interval'));
        setImages(parsedImages);
        setSaved(parsedImages);
        setIntervalSeconds(parsedInterval);
        setSavedInterval(parsedInterval);
      })
      .catch(() => showToast('error', 'No se pudo cargar la galería.'))
      .finally(() => setLoading(false));
  }, []);

  const dirty = JSON.stringify(images) !== JSON.stringify(saved) || intervalSeconds !== savedInterval;

  const update = (index: number, patch: Partial<GalleryImage>) => {
    setImages((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    setImages((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = async (index: number) => {
    const confirmed = await showConfirm({
      title: 'Quitar foto de la galería',
      message: 'La foto dejaría de aparecer en el carrusel. El archivo se queda en la biblioteca de medios.',
      confirmLabel: 'Quitar',
      danger: true,
    });
    if (!confirmed) return;
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const save = async () => {
    const withImage = images.filter((image) => image.imageUrl);
    if (withImage.length === 0 && images.length > 0) {
      showToast('error', 'Elige una imagen para cada foto o quita las filas vacías.');
      return;
    }

    setSaving(true);
    try {
      await siteApi.updateSettings({
        community_gallery: JSON.stringify(withImage),
        community_gallery_interval: String(intervalSeconds),
      });
      setImages(withImage);
      setSaved(withImage);
      setSavedInterval(intervalSeconds);
      showToast('success', 'Galería guardada. Ya se ve en Inicio y Comunidad.');
    } catch {
      showToast('error', 'No se pudo guardar la galería. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-16 text-center text-sm text-gray-500">Cargando galería...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-heading text-2xl font-semibold text-gray-800">Galería de la comunidad</h3>
        <p className="mt-1 max-w-3xl text-sm text-gray-500">
Fotos de la comunidad que se muestran solas, en una tira de varias fotos a la vez, arriba de “Nuestras redes” en el inicio y en la página Comunidad. Se ven 5 fotos en pantallas grandes, 4 en portátiles, 3 en tablet, 2 en tablet pequeña y 1 en celular.
        </p>
      </div>

      <section className="card card-body border-gold/30 bg-gold/5" aria-labelledby="gallery-guide-heading">
        <h4 id="gallery-guide-heading" className="font-heading text-lg font-semibold text-gray-800">Cómo funciona</h4>
        <ul className="mt-3 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 font-heading text-gold-dark">1</span>
            <span><strong className="font-semibold">Orden.</strong> Se muestran en el orden de esta lista. Usa las flechas para cambiarlo.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 font-heading text-gold-dark">2</span>
            <span><strong className="font-semibold">Cambio automático.</strong> Cada cuántos segundos la tira avanza una foto. Con 0, el visitante avanza con las flechas.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 font-heading text-gold-dark">3</span>
            <span><strong className="font-semibold">Texto alternativo.</strong> Describe la foto para quienes usan lector de pantalla. Ejemplo: “Jóvenes en el retiro”.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 font-heading text-gold-dark">4</span>
            <span><strong className="font-semibold">Texto visible.</strong> Es opcional y aparece sobre la foto, en una franja oscura.</span>
          </li>
        </ul>
      </section>

      <section className="card card-body">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="font-heading text-lg font-semibold text-gray-800">Fotos del carrusel</h4>
            <p className="mt-1 text-sm text-gray-500">
              {images.length === 0
                ? 'Todavía no hay fotos, así que el carrusel no se muestra en el sitio.'
                : `${images.length} de ${MAX_GALLERY_IMAGES}.`}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setImages((current) => [...current, emptyImage()])}
            disabled={images.length >= MAX_GALLERY_IMAGES || saving}
          >
            <FiPlus aria-hidden="true" /> Agregar foto
          </button>
        </div>

        {images.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">Agrega la primera foto para que el carrusel aparezca.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {images.map((image, index) => (
              <li key={image.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex flex-col">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0 || saving} className="min-h-9 min-w-9 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30" aria-label={`Subir foto ${index + 1}`}><FiArrowUp aria-hidden="true" /></button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === images.length - 1 || saving} className="min-h-9 min-w-9 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30" aria-label={`Bajar foto ${index + 1}`}><FiArrowDown aria-hidden="true" /></button>
                  </div>

                  <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-dark">
                    {image.imageUrl
                      ? <img src={image.imageUrl} alt="" className="h-full w-full object-cover" />
                      : <div className="flex h-full items-center justify-center text-xs text-cream/70">Sin imagen</div>}
                  </div>

                  <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="field-group sm:col-span-2">
                      <label className="label" htmlFor={`gallery-alt-${index}`}>Texto alternativo (describe la foto)</label>
                      <input
                        id={`gallery-alt-${index}`}
                        type="text"
                        maxLength={120}
                        className="input w-full"
                        value={image.alt}
                        onChange={(event) => update(index, { alt: event.target.value })}
                        placeholder="Jóvenes en el retiro de la iglesia"
                      />
                    </div>
                    <div className="field-group sm:col-span-2">
                      <label className="label" htmlFor={`gallery-caption-${index}`}>Texto sobre la foto <span className="font-normal text-gray-400">(opcional)</span></label>
                      <input
                        id={`gallery-caption-${index}`}
                        type="text"
                        maxLength={160}
                        className="input w-full"
                        value={image.caption}
                        onChange={(event) => update(index, { caption: event.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-start justify-end gap-2">
                    <button type="button" className="btn btn-secondary whitespace-nowrap" onClick={() => setPickerIndex(index)} disabled={saving}>
                      <FiFolder aria-hidden="true" /> {image.imageUrl ? 'Cambiar' : 'Elegir foto'}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={saving}
                      className="icon-btn text-red-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Quitar foto ${index + 1}`}
                    >
                      <FiTrash2 aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md">
            <label className="label" htmlFor="gallery-interval">Segundos entre fotos</label>
            <p className="mb-2 text-xs text-gray-500">Con 0 las fotos no cambian solas y el visitante usa las flechas.</p>
            <input
              id="gallery-interval"
              type="number"
              min={0}
              max={30}
              step={1}
              className="input w-28"
              value={intervalSeconds}
              onChange={(event) => setIntervalSeconds(Math.max(0, Math.min(30, Number(event.target.value) || 0)))}
            />
          </div>
          <div className="flex gap-3">
            {dirty && <button type="button" className="btn btn-secondary" onClick={() => { setImages(saved); setIntervalSeconds(savedInterval); }} disabled={saving}>Descartar</button>}
            <button type="button" className="btn btn-primary" onClick={save} disabled={saving || !dirty}>
              <FiSave aria-hidden="true" /> {saving ? 'Guardando...' : 'Guardar galería'}
            </button>
          </div>
        </div>
      </section>

      <MediaPicker
        open={pickerIndex !== null}
        onClose={() => setPickerIndex(null)}
        onSelect={(url) => {
          if (pickerIndex !== null) update(pickerIndex, { imageUrl: url });
          setPickerIndex(null);
        }}
      />
    </div>
  );
}
