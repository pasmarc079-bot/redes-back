import { FiServer, FiDatabase, FiCloud, FiShield, FiCode, FiMonitor } from 'react-icons/fi';

const technologies = [
  {
    category: 'Frontend — Sitio Público',
    icon: <FiMonitor size={20} />,
    color: 'bg-blue-100 text-blue-600',
    items: [
      { name: 'React 18', desc: 'Framework UI para componentes reactivos' },
      { name: 'Vite', desc: 'Bundler ultrarrápido con HMR' },
      { name: 'Tailwind CSS', desc: 'CSS utility-first para diseño responsive' },
      { name: 'Framer Motion', desc: 'Animaciones fluidas en scroll y transiciones' },
      { name: 'Zustand', desc: 'Gestión de estado ligera y eficiente' },
      { name: 'React Router v6', desc: 'Enrutamiento SPA con rutas anidadas' },
    ],
  },
  {
    category: 'Admin — Panel de Gestión',
    icon: <FiCode size={20} />,
    color: 'bg-purple-100 text-purple-600',
    items: [
      { name: 'React 18 + Vite', desc: 'Misma base que el sitio público' },
      { name: 'BlockNote Editor', desc: 'Editor WYSIWYG para artículos del blog' },
      { name: 'Axios', desc: 'Cliente HTTP con interceptores JWT' },
      { name: 'React Icons', desc: 'Biblioteca de iconos Feather/Lucide' },
    ],
  },
  {
    category: 'Backend — API',
    icon: <FiServer size={20} />,
    color: 'bg-green-100 text-green-600',
    items: [
      { name: 'Node.js + Express', desc: 'Servidor REST API con TypeScript' },
      { name: 'Prisma ORM', desc: 'Gestión de base de datos con tipado' },
      { name: 'JWT Auth', desc: 'Autenticación por tokens (256-bit secret)' },
      { name: 'Nodemailer', desc: 'Envío de emails (contacto)' },
      { name: 'Multer', desc: 'Upload de archivos multipart' },
      { name: 'Rate Limiting', desc: 'Protección contra abuso (500 req/15min)' },
    ],
  },
  {
    category: 'Base de Datos',
    icon: <FiDatabase size={20} />,
    color: 'bg-amber-100 text-amber-600',
    items: [
      { name: 'PostgreSQL 16', desc: 'Base de datos relacional robusta' },
      { name: '12 modelos', desc: 'User, Event, BlogPost, SiteSetting, SocialConfig, Media, PageContent, etc.' },
      { name: 'Seed script', desc: 'Datos iniciales: 5 redes sociales, 20+ settings, menús, servicios' },
    ],
  },
  {
    category: 'Servicios en la Nube',
    icon: <FiCloud size={20} />,
    color: 'bg-cyan-100 text-cyan-600',
    items: [
      { name: 'Cloudinary', desc: 'Almacenamiento y optimización de imágenes' },
      { name: 'Transformaciones', desc: 'Genera thumbnails y versiones medium automáticamente' },
      { name: 'Formato auto', desc: 'Convierte a WebP para mejor compresión' },
    ],
  },
  {
    category: 'Seguridad',
    icon: <FiShield size={20} />,
    color: 'bg-red-100 text-red-600',
    items: [
      { name: 'JWT 256-bit', desc: 'Tokens de autenticación seguros' },
      { name: 'Rate Limiter', desc: 'Límite de 500 peticiones por 15 minutos' },
      { name: 'CORS configurado', desc: 'Solo permite origen del frontend' },
      { name: 'Input validation', desc: 'Validación en backend y frontend' },
    ],
  },
];

const endpoints = [
  { method: 'GET', path: '/api/v1/health', desc: 'Health check del servidor' },
  { method: 'POST', path: '/api/v1/auth/login', desc: 'Iniciar sesión (obtiene JWT)' },
  { method: 'GET', path: '/api/v1/events', desc: 'Lista de eventos públicos' },
  { method: 'GET', path: '/api/v1/posts', desc: 'Lista de artículos del blog' },
  { method: 'GET', path: '/api/v1/social/configs', desc: 'Configuración de redes sociales' },
  { method: 'GET', path: '/api/v1/site/settings', desc: 'Configuración general del sitio' },
  { method: 'POST', path: '/api/v1/contact', desc: 'Enviar mensaje de contacto' },
  { method: 'POST', path: '/api/v1/admin/events', desc: 'Crear evento (auth)' },
  { method: 'PUT', path: '/api/v1/admin/events/:id', desc: 'Actualizar evento (auth)' },
  { method: 'POST', path: '/api/v1/admin/posts', desc: 'Crear artículo (auth)' },
  { method: 'POST', path: '/api/v1/admin/media/upload', desc: 'Subir imagen (auth)' },
  { method: 'GET', path: '/api/v1/admin/media/health', desc: 'Estado de Cloudinary (auth)' },
];

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-amber-100 text-amber-700',
  DELETE: 'bg-red-100 text-red-700',
};

export default function SystemInfo() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8" data-testid="system-info-container">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl text-gray-800">Acerca del Sistema</h1>
        <p className="text-sm text-gray-500 mt-1">
          Documentación técnica del proyecto Ministerio REDES — arquitectura, tecnologías y servicios.
        </p>
      </div>

      {/* Architecture overview */}
      <div className="card card-body p-6">
        <h2 className="font-heading text-xl font-semibold text-gray-800 mb-4">Arquitectura General</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="font-heading font-semibold text-blue-800 mb-2">Frontend (Puerto 5173)</h3>
            <p className="text-sm text-blue-700">SPA pública con React + Vite. Se despliega como estáticos con proxy reverso al backend.</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <h3 className="font-heading font-semibold text-purple-800 mb-2">Admin (Puerto 5173)</h3>
            <p className="text-sm text-purple-700">Panel de administración integrado en la misma app, bajo la ruta <code className="bg-purple-100 px-1 rounded">/admin/*</code>.</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <h3 className="font-heading font-semibold text-green-800 mb-2">Backend (Puerto 8080)</h3>
            <p className="text-sm text-green-700">API REST con Express + Prisma. Se conecta a PostgreSQL y Cloudinary.</p>
          </div>
        </div>
      </div>

      {/* Technologies */}
      <div className="card card-body p-6">
        <h2 className="font-heading text-xl font-semibold text-gray-800 mb-6">Tecnologías Utilizadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technologies.map((tech) => (
            <div key={tech.category} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${tech.color}`}>
                  {tech.icon}
                </div>
                <h3 className="font-heading font-semibold text-gray-800 text-sm">{tech.category}</h3>
              </div>
              <ul className="space-y-2 ml-1">
                {tech.items.map((item) => (
                  <li key={item.name} className="text-sm">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="text-gray-500"> — {item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoints */}
      <div className="card card-body p-6">
        <h2 className="font-heading text-xl font-semibold text-gray-800 mb-4">Endpoints Principales</h2>
        <p className="text-sm text-gray-500 mb-4">
          API REST con prefijo <code className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs">/api/v1</code>. Los endpoints marcados con (auth) requieren token JWT.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-500">Método</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Ruta</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {endpoints.map((ep) => (
                <tr key={ep.path} className="hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <span className={`badge text-xs font-mono ${methodColors[ep.method]}`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-xs text-gray-700">{ep.path}</td>
                  <td className="py-2 px-3 text-gray-600">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credentials */}
      <div className="card card-body p-6">
        <h2 className="font-heading text-xl font-semibold text-gray-800 mb-4">Credenciales de Desarrollo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 text-sm mb-2">Admin Principal</h3>
            <p className="text-xs text-gray-600">Usuario: <code className="bg-gray-200 px-1 rounded">pasmarc079</code></p>
            <p className="text-xs text-gray-600">Contraseña: <code className="bg-gray-200 px-1 rounded">Excelencia079</code></p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 text-sm mb-2">Editor</h3>
            <p className="text-xs text-gray-600">Usuario: <code className="bg-gray-200 px-1 rounded">editor</code></p>
            <p className="text-xs text-gray-600">Contraseña: <code className="bg-gray-200 px-1 rounded">editor123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
