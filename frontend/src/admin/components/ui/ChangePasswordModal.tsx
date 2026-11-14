import { useState } from 'react';
import { FiKey, FiX } from 'react-icons/fi';
import adminApi from '@/services/adminApi';
import { showToast } from '@/admin/components/ui/Toast';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const MIN_LENGTH = 10;

/** Lets anyone signed in change their own password, without leaving the panel. */
export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const close = () => {
    setCurrentPassword('');
    setNewPassword('');
    setRepeatPassword('');
    setError('');
    onClose();
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (newPassword.length < MIN_LENGTH) {
      setError(`La nueva contraseña debe tener al menos ${MIN_LENGTH} caracteres.`);
      return;
    }
    if (newPassword !== repeatPassword) {
      setError('Las dos contraseñas nuevas no son iguales.');
      return;
    }

    setSaving(true);
    try {
      const res = await adminApi.post('/auth/change-password', { currentPassword, newPassword });
      // The API returns a fresh token so the session survives the change.
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }
      showToast('success', 'Tu contraseña fue actualizada.');
      close();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudo cambiar la contraseña.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="change-password-title">
      <div className="w-full rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-dark">Tu cuenta</p>
            <h4 id="change-password-title" className="mt-1 flex items-center gap-2 font-heading text-lg font-semibold text-gray-800">
              <FiKey aria-hidden="true" /> Cambiar contraseña
            </h4>
          </div>
          <button type="button" onClick={close} className="min-h-11 min-w-11 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Cerrar">
            <FiX size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 px-5 py-5" noValidate>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="field-group">
            <label className="label" htmlFor="current-password">Contraseña actual</label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              className="input w-full"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label className="label" htmlFor="new-password">Nueva contraseña</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              className="input w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-gray-500">Mínimo {MIN_LENGTH} caracteres.</p>
          </div>

          <div className="field-group">
            <label className="label" htmlFor="repeat-password">Repite la nueva contraseña</label>
            <input
              id="repeat-password"
              type="password"
              autoComplete="new-password"
              className="input w-full"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={close} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar contraseña'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
