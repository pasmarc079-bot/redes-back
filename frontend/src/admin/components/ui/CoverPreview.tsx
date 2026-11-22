import { useState } from 'react';
import { FiMonitor, FiSmartphone } from 'react-icons/fi';
import { overlayVeilStyle } from '@/utils/overlayOpacity';

type Device = 'desktop' | 'mobile';

interface CoverPreviewProps {
  desktopImage?: string;
  mobileImage?: string;
  /** Darkness of the veil, as the percentage saved with the page. */
  opacity: number;
  /** Small golden line above the title, as the page renders it. */
  eyebrow?: string;
  /** Title the page shows over the photo. */
  title: string;
}

/**
 * Shows the cover band of a page with the darkness picked in the slider, before saving.
 * It mirrors the public page: same photo rule (one image is used for both sizes), same dark veil,
 * same golden text. The device toggle changes which photo is used so the editor can compare both.
 */
export default function CoverPreview({ desktopImage, mobileImage, opacity, eyebrow, title }: CoverPreviewProps) {
  const [device, setDevice] = useState<Device>('desktop');
  const image = device === 'mobile' ? mobileImage || desktopImage : desktopImage || mobileImage;
  const frame = device === 'mobile'
    ? 'mx-auto aspect-[9/16] w-[190px]'
    : 'aspect-[16/7] w-full';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-700">Vista previa de la portada</p>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1" role="group" aria-label="Tamaño de la vista previa">
          <button
            type="button"
            aria-pressed={device === 'desktop'}
            onClick={() => setDevice('desktop')}
            className={`flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${device === 'desktop' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FiMonitor aria-hidden="true" /> Computadora
          </button>
          <button
            type="button"
            aria-pressed={device === 'mobile'}
            onClick={() => setDevice('mobile')}
            className={`flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${device === 'mobile' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FiSmartphone aria-hidden="true" /> Celular
          </button>
        </div>
      </div>

      <div className={`relative overflow-hidden rounded-xl border border-gray-200 bg-dark ${frame}`}>
        {image ? (
          <>
            <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
            <div
              className="absolute inset-0 bg-dark"
              style={overlayVeilStyle(opacity)}
              data-veil-opacity={opacity}
              aria-hidden="true"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              {eyebrow && (
                <p className="mb-1.5 font-heading text-[10px] uppercase tracking-[0.2em] text-gold sm:text-xs">{eyebrow}</p>
              )}
              <p className="font-display text-xl tracking-wider text-gold md:text-3xl">{title}</p>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 px-4 text-center">
            <p className="text-sm font-semibold text-cream/80">Todavía no hay foto de portada</p>
            <p className="text-xs text-cream/60">Elige una imagen arriba y aquí verás cómo queda el texto sobre ella.</p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Así se verá la portada en el sitio, con <span className="font-semibold text-gray-700">{opacity}%</span> de oscuridad.
        Mueve el control de abajo para comparar: no hace falta guardar para verlo.
      </p>
    </div>
  );
}
