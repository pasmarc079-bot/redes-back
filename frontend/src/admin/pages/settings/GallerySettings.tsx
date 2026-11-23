import { useEffect, useState } from 'react';
import {
  FiArrowDown,
  FiArrowUp,
  FiEdit3,
  FiFolder,
  FiImage,
  FiPlus,
  FiSave,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { showConfirm } from '@/admin/components/ui/ConfirmModal';
import MediaPicker from '@/admin/components/ui/MediaPicker';
import { showToast } from '@/admin/components/ui/Toast';
import { siteApi } from '@/services/api';
import {
  DEFAULT_GALLERY_INTERVAL_SECONDS,
  parseGalleryImages,
  parseGalleryInterval,
  type GalleryImage,
} from '@/utils/communityGallery';

const newImageId = () => `gallery-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

const apiError = (error: any, fallback: string) => error?.response?.data?.error || fallback;

interface EditorState {
  /** null cuando la foto es nueva; si no, su posición en la lista. */
  index: number | null;
  draft: GalleryImage;
}

/**
 * Photos of the community shown as an automatic carousel before "Nuestras redes", on the home page
 * and on Comunidad. The same component is used on both, so they always show the same photos.
 *
 * Every photo change is saved right away: adding a photo, editing it, removing it or moving it.
 * Only the seconds between photos need their own button.
 */
export default function GallerySettings() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [intervalSeconds, setIntervalSeconds] = useState(DEFAULT_GALLERY_INTERVAL_SECONDS);
  const [savedInterval, setSavedInterval] = useState(DEFAULT_GALLERY_INTERVAL_SECONDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingInterval, setSavingInterval] = useState(false);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [editorError, setEditorError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    siteApi.getSettingsFull()
      .then((res) => {
        const value = (key: string) => res.data.find((item: { key: string }) => item.key === key)?.value;
        const parsedImages = parseGalleryImages(value('community_gallery'));
        const parsedInterval = parseGalleryInterval(value('community_gallery_interval'));
        setImages(parsedImages);
        setIntervalSeconds(parsedInterval);
        setSavedInterval(parsedInterval);
      })
      .catch(() => showToast('error', 'No se pudo cargar la galería.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!editor) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || pickerOpen) return;
      setEditor(null);
      setEditorError('');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editor, pickerOpen]);

  const persist = async (next: GalleryImage[], message: string) => {
    setSaving(true);
    try {
      await siteApi.updateSettings({
        community_gallery: JSON.stringify(next),
        community_gallery_interval: String(intervalSeconds),
      });
      setImages(next);
      setSavedInterval(intervalSeconds);
      showToast('success', message);
      return true;
    } catch (error) {
      showToast('error', apiError(error, 'No se pudo guardar el cambio. Intenta de nuevo.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveInterval = async () => {
    setSavingInterval(true);
    try {
      await siteApi.updateSettings({
        community_gallery: JSON.stringify(images),
        community_gallery_interval: String(intervalSeconds),
      });
      setSavedInterval(intervalSeconds);
      showToast(
        'success',
        intervalSeconds === 0
          ? 'Guardado: las fotos solo cambian cuando el visitante usa las flechas.'
          : `Guardado: las fotos cambian cada ${intervalSeconds} ${intervalSeconds === 1 ? 'segundo' : 'segundos'}.`,
      );
    } catch (error) {
      showToast('error', apiError(error, 'No se pudo guardar el cambio automático.'));
    } finally {
      setSavingInterval(false);
    }
  };

  const openNew = () => {
    setEditorError('');
    setEditor({ index: null, draft: { id: newImageId(), imageUrl: '', alt: '', caption: '' } });
  };

  const openEdit = (index: number) => {
    setEditorError('');
    setEditor({ index, draft: { ...images[index] } });
  };

  const closeEditor = () => {
    setEditor(null);
    setEditorError('');
    setPickerOpen(false);
  };

  const saveEditor = async () => {
    if (!editor || saving) return;
    if (!editor.draft.imageUrl) {
      setEditorError('Elige una foto de la biblioteca para poder agregarla al carrusel.');
      return;
    }

    const clean: GalleryImage = {
      id: editor.draft.id || newImageId(),
      imageUrl: editor.draft.imageUrl,
      alt: editor.draft.alt.trim(),
      caption: editor.draft.caption.trim(),
    };
    const next = editor.index === null
      ? [...images, clean]
      : images.map((item, index) => (index === editor.index ? clean : item));

    setEditorError('');
    const ok = await persist(
      next,
      editor.index === null ? 'Foto agregada. Ya se ve en el carrusel.' : 'Foto actualizada.',
    );
    if (ok) setEditor(null);
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    await persist(next, 'Orden actualizado.');
  };

  const remove = async (index: number) => {
    const confirmed = await showConfirm({
      title: 'Quitar foto de la galería',
      message:
        'La foto deja de aparecer en el carrusel del sitio. El archivo sigue en la biblioteca de medios, así que puedes volver a usarlo cuando quieras.',
      confirmLabel: 'Quitar foto',
      danger: true,
    });
    if (!confirmed) return;
    await persist(images.filter((_, itemIndex) => itemIndex !== index), 'Foto quitada. Ya no se ve en el sitio.');
  };

  if (loading) return <div className="py-16 text-center text-sm text-gray-500">Cargando galería...</div>;

  const rowActions = (image: GalleryImage, index: number) => (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => move(index, -1)}
        disabled={index === 0 || saving}
        className="icon-btn text-gray-500 hover:bg-gray-200 disabled:opacity-30"
        aria-label={`Subir foto ${index + 1}`}
        title="Subir"
      >
        <FiArrowUp aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => move(index, 1)}
        disabled={index === images.length - 1 || saving}
        className="icon-btn text-gray-500 hover:bg-gray-200 disabled:opacity-30"
        aria-label={`Bajar foto ${index + 1}`}
        title="Bajar"
      >
        <FiArrowDown aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => openEdit(index)}
        disabled={saving}
        className="icon-btn text-gray-500 hover:bg-gold/10 hover:text-gold-dark"
        aria-label={`Editar foto ${index + 1}: ${image.alt || 'sin texto alternativo'}`}
        title="Editar foto"
      >
        <FiEdit3 aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => remove(index)}
        disabled={saving}
        className="icon-btn text-red-400 hover:bg-red-50 hover:text-red-600"
        aria-label={`Quitar foto ${index + 1}: ${image.alt || 'sin texto alternativo'}`}
        title="Quitar foto"
      >
        <FiTrash2 aria-hidden="true" />
      </button>
    </div>
  );

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
            <span><strong className="font-semibold">Agregar o editar.</strong> El botón abre una ventana donde eliges la foto y escribes sus textos. No hay límite de fotos.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 font-heading text-gold-dark">2</span>
            <span><strong className="font-semibold">Se guarda al instante.</strong> Cada vez que agregas, editas, quitas o mueves una foto, el cambio ya queda guardado y visible en el sitio al recargar.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 font-heading text-gold-dark">3</span>
            <span><strong className="font-semibold">Orden.</strong> Se muestran en el orden de esta tabla. Usa las flechas ↑↓ de cada fila para cambiarlo.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 font-heading text-gold-dark">4</span>
            <span><strong className="font-semibold">Textos.</strong> El alternativo describe la foto para lectores de pantalla; el otro es opcional y aparece en una franja oscura sobre la foto.</span>
          </li>
        </ul>
      </section>

      <section className="card card-body" aria-labelledby="gallery-photos-heading">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 id="gallery-photos-heading" className="font-heading text-lg font-semibold text-gray-800">Fotos del carrusel</h4>
            <p className="mt-1 text-sm text-gray-500">
              {images.length === 0
                ? 'Todavía no hay fotos, así que el carrusel no se muestra en el sitio.'
                : `${images.length} ${images.length === 1 ? 'foto' : 'fotos'}. Los cambios se guardan al instante.`}
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={openNew} disabled={saving}>
            <FiPlus aria-hidden="true" /> Agregar foto
          </button>
        </div>

        {images.length === 0 ? (
          <div className="py-10 text-center">
            <FiImage aria-hidden="true" className="mx-auto text-3xl text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">Agrega la primera foto para que el carrusel aparezca en el sitio.</p>
            <button type="button" className="btn btn-secondary mt-4" onClick={openNew}>
              <FiPlus aria-hidden="true" /> Agregar la primera foto
            </button>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="mt-4 w-full border-collapse text-sm">
                <caption className="sr-only">
                  Fotos del carrusel: orden, foto, texto alternativo, texto sobre la foto y acciones.
                </caption>
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th scope="col" className="w-20 py-2 pl-2">Foto</th>
                    <th scope="col" className="py-2 pr-4">Texto alternativo</th>
                    <th scope="col" className="py-2 pr-4">Texto sobre la foto</th>
                    <th scope="col" className="w-36 py-2 pr-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {images.map((image, index) => (
                    <tr key={image.id} className="border-b border-gray-100 align-middle last:border-0 hover:bg-gray-50/70">
                      <td className="py-2 pl-2">
                        <div className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-dark">
                          <img src={image.imageUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        {image.alt
                          ? <span className="text-gray-800">{image.alt}</span>
                          : <span className="text-amber-700">Sin texto alternativo</span>}
                      </td>
                      <td className="py-2 pr-4">
                        {image.caption
                          ? <span className="text-gray-800">{image.caption}</span>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-2 pr-2">{rowActions(image, index)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-4 divide-y divide-gray-100 md:hidden">
              {images.map((image, index) => (
                <li key={image.id} className="flex items-center gap-3 py-3">
                  <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-dark">
                    <img src={image.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm ${image.alt ? 'text-gray-800' : 'text-amber-700'}`}>
                      {image.alt || 'Sin texto alternativo'}
                    </p>
                    <p className="truncate text-xs text-gray-500">{image.caption || 'Sin texto sobre la foto'}</p>
                  </div>
                  {rowActions(image, index)}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-sm">
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
          {intervalSeconds === savedInterval ? (
            <p className="text-sm text-gray-500">El cambio automático ya está guardado.</p>
          ) : (
            <button type="button" className="btn btn-primary" onClick={saveInterval} disabled={savingInterval}>
              <FiSave aria-hidden="true" /> {savingInterval ? 'Guardando...' : 'Guardar cambio automático'}
            </button>
          )}
        </div>
      </section>

      {editor && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-photo-title"
          onClick={closeEditor}
        >
          <div
            className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
                  {editor.index === null ? 'Nueva foto' : `Foto ${editor.index + 1} de ${images.length}`}
                </p>
                <h4 id="gallery-photo-title" className="mt-1 font-heading text-lg font-semibold text-gray-800">
                  {editor.index === null ? 'Agregar foto al carrusel' : 'Editar foto del carrusel'}
                </h4>
              </div>
              <button type="button" onClick={closeEditor} className="icon-btn rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Cerrar">
                <FiX size={20} aria-hidden="true" />
              </button>
            </div>

            <form
              className="space-y-5 px-5 py-5"
              onSubmit={(event) => { event.preventDefault(); saveEditor(); }}
              noValidate
            >
              {editorError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{editorError}</p>}

              <div>
                <p className="label mb-2">Foto</p>
                {editor.draft.imageUrl ? (
                  <div className="flex items-start gap-4">
                    <img
                      src={editor.draft.imageUrl}
                      alt=""
                      className="h-32 w-28 shrink-0 rounded-lg border border-gray-200 bg-dark object-cover"
                    />
                    <div>
                      <button type="button" className="btn btn-secondary" onClick={() => setPickerOpen(true)}>
                        <FiFolder aria-hidden="true" /> Cambiar foto
                      </button>
                      <p className="mt-2 text-xs text-gray-500">En el carrusel se recorta en vertical (4:5).</p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    autoFocus
                    onClick={() => setPickerOpen(true)}
                    className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600 hover:border-gold focus-visible:border-gold"
                  >
                    <FiImage size={24} aria-hidden="true" />
                    <span className="font-semibold text-gray-800">Elegir foto de la biblioteca</span>
                    <span className="text-xs text-gray-500">Desde ahí también puedes subir una imagen nueva.</span>
                  </button>
                )}
              </div>

              <div className="field-group">
                <label className="label" htmlFor="gallery-photo-alt">Texto alternativo</label>
                <p className="mb-2 text-xs text-gray-500">Describe la foto para quienes usan lector de pantalla. Ejemplo: “Jóvenes en el retiro”.</p>
                <input
                  id="gallery-photo-alt"
                  type="text"
                  maxLength={120}
                  className="input w-full"
                  value={editor.draft.alt}
                  onChange={(event) => setEditor((current) => current && {
                    ...current,
                    draft: { ...current.draft, alt: event.target.value },
                  })}
                  placeholder="Jóvenes en el retiro de la iglesia"
                />
                {!editor.draft.alt.trim() && (
                  <p className="mt-1 text-xs text-amber-700">
                    Si lo dejas vacío, el lector de pantalla solo dirá “Foto de la comunidad del Ministerio REDES”.
                  </p>
                )}
              </div>

              <div className="field-group">
                <label className="label" htmlFor="gallery-photo-caption">
                  Texto sobre la foto <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <p className="mb-2 text-xs text-gray-500">Aparece en una franja oscura encima de la foto, en el carrusel.</p>
                <input
                  id="gallery-photo-caption"
                  type="text"
                  maxLength={160}
                  className="input w-full"
                  value={editor.draft.caption}
                  onChange={(event) => setEditor((current) => current && {
                    ...current,
                    draft: { ...current.draft, caption: event.target.value },
                  })}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">Se guarda al instante, sin pasos extra.</p>
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button type="button" className="btn btn-secondary" onClick={closeEditor}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Guardando...' : editor.index === null ? 'Agregar foto' : 'Guardar foto'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          setEditor((current) => current && { ...current, draft: { ...current.draft, imageUrl: url } });
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
