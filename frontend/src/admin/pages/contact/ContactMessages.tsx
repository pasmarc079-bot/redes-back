import { useEffect, useState } from 'react';
import { FiMail, FiTrash2, FiRefreshCw, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import adminApi from '@/services/adminApi';
import { showConfirm } from '@/admin/components/ui/ConfirmModal';
import { showToast } from '@/admin/components/ui/Toast';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
  readAt: string | null;
}

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  received: { text: 'Sin correo enviado', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  logged: { text: 'Registrado', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  sent: { text: 'Enviado por correo', className: 'bg-green-50 text-green-700 border-green-200' },
};

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    adminApi
      .get('/admin/contact-messages')
      .then((res) => setMessages(res.data))
      .catch(() => setError('No se pudieron cargar los mensajes. Verifica tu conexión e inténtalo de nuevo.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await adminApi.put(`/admin/contact-messages/${id}/read`);
      setMessages((current) => current.map((m) => (m.id === id ? { ...m, readAt: new Date().toISOString() } : m)));
    } catch {
      showToast('error', 'No se pudo marcar el mensaje como leído.');
    }
  };

  const remove = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Eliminar mensaje',
      message: 'El mensaje se borrará definitivamente. Si el visitante todavía no ha sido respondido, conviene copiarlo antes.',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!confirmed) return;
    try {
      await adminApi.delete(`/admin/contact-messages/${id}`);
      setMessages((current) => current.filter((m) => m.id !== id));
    } catch {
      showToast('error', 'No se pudo eliminar el mensaje.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-heading text-2xl font-semibold text-gray-800">Mensajes del formulario</h3>
          <p className="mt-1 text-sm text-gray-500">
            Todo lo que llega desde la página de contacto queda guardado aquí, aunque el correo no se pueda enviar.
          </p>
        </div>
        <button type="button" onClick={load} className="btn btn-secondary self-start sm:self-auto">
          <FiRefreshCw aria-hidden="true" /> Actualizar
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm text-gray-500">Cargando mensajes...</p>
      ) : messages.length === 0 ? (
        <div className="card card-body py-16 text-center">
          <FiMail className="mx-auto text-4xl text-gray-300" aria-hidden="true" />
          <p className="mt-3 text-sm text-gray-500">Todavía no hay mensajes.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {messages.map((message) => {
            const status = STATUS_LABEL[message.status] ?? STATUS_LABEL.received;
            return (
              <li
                key={message.id}
                className={`card card-body ${message.readAt ? 'opacity-70' : 'border-l-4 border-l-gold'}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-heading font-semibold text-gray-800">{message.name}</p>
                    <a href={`mailto:${message.email}`} className="text-sm text-gold-ink hover:underline">
                      {message.email}
                    </a>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{message.message}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}>
                      {status.text}
                    </span>
                    <p className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <div className="flex gap-2">
                      {!message.readAt && (
                        <button type="button" onClick={() => markAsRead(message.id)} className="btn btn-secondary text-xs">
                          <FiCheckCircle aria-hidden="true" /> Marcar leído
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(message.id)}
                        className="min-h-11 min-w-11 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Eliminar el mensaje de ${message.name}`}
                      >
                        <FiTrash2 aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="flex items-start gap-2 text-xs text-gray-500">
        <FiAlertTriangle className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
        Si aparece "Sin correo enviado", el servidor no pudo mandar el correo (revisa las variables SMTP). El mensaje
        sigue guardado aquí y puedes responder con un clic al correo del visitante.
      </p>
    </div>
  );
}
