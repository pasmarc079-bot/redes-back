import { useState, FormEvent, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ username: false, password: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const usernameError = touched.username && !username.trim();
  const passwordError = touched.password && !password;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });

    if (!username.trim() || !password) return;

    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.status === 429
          ? 'Demasiados intentos. Espera un momento antes de volver a intentar.'
          : 'Credenciales inválidas. Verifica tu usuario y contraseña.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
              <circle cx="50" cy="50" r="48" fill="#1A1A1A" stroke="#C9A84C" strokeWidth="2"/>
              <path d="M50 12 C32 30 22 50 22 64 C22 78 34 90 50 90 C66 90 78 78 78 64 C78 50 68 30 50 12Z" fill="#C9A84C"/>
              <path d="M50 30 C42 44 37 54 37 64 C37 74 43 80 50 80 C57 80 63 74 63 64 C63 54 58 44 50 30Z" fill="#1A1A1A"/>
              <path d="M50 46 C46 54 44 60 44 66 C44 72 47 76 50 76 C53 76 56 72 56 66 C56 60 54 54 50 46Z" fill="#C9A84C"/>
            </svg>
          </div>
          <h1 className="font-display text-4xl text-gold tracking-wider">REDES</h1>
          <p className="text-silver mt-2 text-sm">Panel de Administración</p>
        </div>

        <div className="card p-8">
          <h2 className="font-heading text-xl text-dark mb-6">Iniciar Sesión</h2>

          {error && (
            <div
              role="alert"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2"
            >
              <span className="mt-0.5 shrink-0" aria-hidden="true">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="username" className="label">
                Usuario o Email
              </label>
              <input
                ref={usernameRef}
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
                className={`input ${usernameError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                placeholder="admin"
                required
                autoComplete="username"
                aria-invalid={usernameError || undefined}
                aria-describedby={usernameError ? 'username-error' : undefined}
              />
              {usernameError && (
                <p id="username-error" className="mt-1 text-xs text-red-500" role="alert">
                  Ingresa tu usuario o email
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  className={`input pr-10 ${passwordError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  aria-invalid={passwordError || undefined}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {passwordError && (
                <p id="password-error" className="mt-1 text-xs text-red-500" role="alert">
                  Ingresa tu contraseña
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-silver text-sm hover:text-gold transition-colors">
            ← Volver al sitio público
          </a>
        </p>
      </div>
    </div>
  );
}
