import { FiAlertTriangle } from 'react-icons/fi';
import { MAX_OVERLAY_OPACITY, MIN_OVERLAY_OPACITY, clampOverlayOpacity } from '@/utils/overlayOpacity';

interface OverlayOpacityFieldProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  help?: string;
  /** Shows the amber warning when the veil is too light for the text over it. */
  warnBelow?: number;
}

/**
 * Darkness of the veil over a photograph. The same control is used by the hero messages, the
 * cover of every page and the community gallery, so the scale means the same everywhere:
 * 0% keeps the photo clear and 100% is the darkest veil.
 */
export default function OverlayOpacityField({
  id,
  value,
  onChange,
  label = 'Oscuridad sobre la imagen',
  help = 'Qué tanto se oscurece la foto detrás del texto. Si la bajas, la foto se ve más clara y luminosa.',
  warnBelow = 40,
}: OverlayOpacityFieldProps) {
  const helpId = `${id}-help`;
  const opacity = clampOverlayOpacity(value);

  return (
    <div className="field-group">
      <label className="label" htmlFor={id}>{label}</label>
      <p id={helpId} className="mb-3 text-xs text-gray-500">{help}</p>
      <div className="flex items-center gap-4">
        <input
          id={id}
          type="range"
          min={MIN_OVERLAY_OPACITY}
          max={MAX_OVERLAY_OPACITY}
          step={5}
          value={opacity}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-describedby={helpId}
          aria-valuetext={`${opacity}% de oscuridad`}
          className="h-2 flex-1 cursor-pointer accent-gold"
        />
        <output htmlFor={id} className="w-14 shrink-0 text-right text-sm font-semibold tabular-nums text-gray-700">
          {opacity}%
        </output>
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-400">
        <span>0%: foto clara</span>
        <span>100%: foto oscura</span>
      </div>
      {opacity < warnBelow && (
        <p className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <FiAlertTriangle className="mt-0.5 shrink-0" aria-hidden="true" />
          Con esta oscuridad el texto puede costar leer sobre fotos claras. Si es una portada, revisa cómo se ve antes de guardar.
        </p>
      )}
    </div>
  );
}
