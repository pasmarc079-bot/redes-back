import { type ReactNode, useEffect, useId, useRef } from 'react';
import { FiX } from 'react-icons/fi';

interface EditorModalProps {
  open: boolean;
  title: string;
  /** Context under the title: where the item sits in the list, what saving does. */
  subtitle?: string;
  onClose: () => void;
  /** Keeps the dialog open while another layer, like the media library, is on top. */
  closeOnEscape?: boolean;
  /** Short line shown next to the actions. */
  note?: ReactNode;
  /** Buttons of the footer, in reading order. */
  actions: ReactNode;
  children: ReactNode;
  width?: 'md' | 'lg';
}

/**
 * Dialog used by the settings editors that work one item at a time.
 * The header and the footer stay in place; only the body scrolls, so the actions are always reachable.
 */
export default function EditorModal({
  open,
  title,
  subtitle,
  onClose,
  closeOnEscape = true,
  note,
  actions,
  children,
  width = 'md',
}: EditorModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = bodyOverflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, closeOnEscape]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-dark/45 backdrop-blur-[2px] sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={`flex max-h-[92dvh] w-full animate-slide-in flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_24px_64px_-24px_rgba(26,26,26,0.55)] outline-none sm:rounded-2xl ${
          width === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-lg'
        }`}
      >
        <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="font-heading text-lg font-semibold leading-snug text-gray-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm leading-snug text-gray-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn -mr-2 -mt-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <FiX size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6">
          {children}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-gray-200/80 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="order-2 text-xs leading-relaxed text-gray-500 sm:order-1">{note}</div>
          <div className="order-1 flex flex-col-reverse gap-2 sm:order-2 sm:flex-row [&>*]:whitespace-nowrap">
            {actions}
          </div>
        </footer>
      </div>
    </div>
  );
}
