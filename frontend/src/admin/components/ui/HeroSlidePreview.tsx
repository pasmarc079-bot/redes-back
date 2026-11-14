import { useCallback, useEffect, useRef, useState } from 'react';
import { FiMonitor, FiSmartphone } from 'react-icons/fi';
import type { HeroSlide } from '@/utils/heroSlides';
import { HERO_PREVIEW_MESSAGE, HERO_PREVIEW_READY } from '@/pages/HeroPreview';

type Device = 'desktop' | 'mobile';

/** Real viewports: the preview runs at the size of the device it pretends to be. */
const FRAMES: Record<Device, { width: number; height: number }> = {
  desktop: { width: 1440, height: 760 },
  mobile: { width: 390, height: 780 },
};

interface HeroSlidePreviewProps {
  slide: HeroSlide;
}

/**
 * Live preview of a cover slide. It runs the real cover inside an iframe with its own viewport,
 * so the desktop and mobile versions are shown exactly as a visitor would see them.
 */
export default function HeroSlidePreview({ slide }: HeroSlidePreviewProps) {
  const [device, setDevice] = useState<Device>('desktop');
  const [scale, setScale] = useState(0.4);
  const [ready, setReady] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const frame = FRAMES[device];

  // The iframe is a real device viewport; it is scaled down to fit the panel.
  useEffect(() => {
    const box = boxRef.current;
    if (!box || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / FRAMES[device].width));
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, [device]);

  const send = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: HERO_PREVIEW_MESSAGE, slide },
      window.location.origin,
    );
  }, [slide]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === HERO_PREVIEW_READY) {
        setReady(true);
        send();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [send]);

  useEffect(() => {
    if (ready) send();
  }, [ready, send]);

  return (
    <section aria-label="Vista previa de la portada" className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Así se verá en la portada</p>
        <div className="flex rounded-lg border border-gray-200 p-0.5" role="group" aria-label="Dispositivo de la vista previa">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            aria-pressed={device === 'desktop'}
            className={`flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ${
              device === 'desktop' ? 'bg-dark text-cream' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <FiMonitor aria-hidden="true" /> Computadora
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            aria-pressed={device === 'mobile'}
            className={`flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ${
              device === 'mobile' ? 'bg-dark text-cream' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <FiSmartphone aria-hidden="true" /> Celular
          </button>
        </div>
      </div>

      <div className={`flex justify-center ${device === 'mobile' ? 'bg-gray-100 p-4' : ''}`}>
        <div
          ref={boxRef}
          className={`relative overflow-hidden bg-dark shadow-sm ${device === 'mobile' ? 'rounded-2xl border-4 border-gray-800' : 'rounded-xl border border-gray-200'}`}
          style={{
            width: device === 'mobile' ? 'min(100%, 260px)' : '100%',
            aspectRatio: `${frame.width} / ${frame.height}`,
          }}
        >
          <iframe
            ref={frameRef}
            title="Vista previa del mensaje de la portada"
            src="/preview/hero"
            loading="lazy"
            className="absolute left-0 top-0 origin-top-left border-0"
            style={{ width: frame.width, height: frame.height, transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </section>
  );
}
