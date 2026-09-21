import { useEffect, useState } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

let confirmId = 0;
let confirmListeners: ((opts: ConfirmOptions & { id: number; resolve: (v: boolean) => void }) => void)[] = [];

export function showConfirm(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const id = ++confirmId;
    confirmListeners.forEach((fn) => fn({ ...opts, id, resolve }));
  });
}

export default function ConfirmModal() {
  const [state, setState] = useState<(ConfirmOptions & { id: number; resolve: (v: boolean) => void }) | null>(null);

  useEffect(() => {
    const handler = (opts: ConfirmOptions & { id: number; resolve: (v: boolean) => void }) => {
      setState(opts);
    };
    confirmListeners.push(handler);
    return () => { confirmListeners = confirmListeners.filter((fn) => fn !== handler); };
  }, []);

  if (!state) return null;

  const close = (result: boolean) => {
    state.resolve(result);
    setState(null);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50" onClick={() => close(false)}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6 animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-full ${state.danger ? 'bg-red-100' : 'bg-amber-100'}`}>
            <FiAlertTriangle className={state.danger ? 'text-red-600' : 'text-amber-600'} size={20} />
          </div>
          <h3 className="font-heading text-lg font-bold text-gray-800">{state.title}</h3>
          <button onClick={() => close(false)} className="ml-auto p-1 text-gray-400 hover:text-gray-600">
            <FiX size={18} />
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-6">{state.message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => close(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {state.cancelLabel || 'Cancelar'}
          </button>
          <button
            onClick={() => close(true)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              state.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-gold hover:bg-gold-dark text-dark'
            }`}
          >
            {state.confirmLabel || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
