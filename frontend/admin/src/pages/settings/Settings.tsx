import { useEffect, useState } from 'react';
import { FiSave, FiPlus, FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api/v1',
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface SiteSetting {
  id: string;
  key: string;
  value: string;
  label: string | null;
  group: string;
  type: string;
}

interface MenuItem {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
  parentId: string | null;
  location: string;
}

interface PageContent {
  id: string;
  key: string;
  title: string | null;
  body: string | null;
  section: string;
  order: number;
  imageUrl: string | null;
  isActive: boolean;
}

interface ServiceSchedule {
  id: string;
  name: string;
  dayOfWeek: string;
  time: string;
  description: string | null;
  order: number;
  isActive: boolean;
}

const tabs = ['General', 'Contacto', 'Nosotros', 'Pastor', 'Menú', 'Contenido', 'Servicios'];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('General');
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [contents, setContents] = useState<PageContent[]>([]);
  const [services, setServices] = useState<ServiceSchedule[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/site/settings/full').then(r => setSettings(r.data));
    api.get('/site/menu').then(r => setMenuItems(r.data));
    api.get('/site/content/admin').then(r => setContents(r.data));
    api.get('/site/services/admin').then(r => setServices(r.data));
  }, []);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveSettings = async () => {
    const updates: Record<string, string> = {};
    settings.forEach(s => { updates[s.key] = s.value; });
    await api.put('/site/settings', updates);
    showSaved();
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const saveMenu = async () => {
    for (const item of menuItems) {
      await api.put(`/site/menu/${item.id}`, item);
    }
    showSaved();
  };

  const addMenuItem = async () => {
    const { data } = await api.post('/site/menu', { label: 'Nuevo', url: '/', order: menuItems.length + 1, location: 'header', isActive: true });
    setMenuItems(prev => [...prev, data]);
  };

  const deleteMenuItem = async (id: string) => {
    await api.delete(`/site/menu/${id}`);
    setMenuItems(prev => prev.filter(i => i.id !== id));
  };

  const updateMenuItem = (id: string, field: string, value: string | number | boolean) => {
    setMenuItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const saveContent = async () => {
    for (const item of contents) {
      await api.put(`/site/content/${item.id}`, item);
    }
    showSaved();
  };

  const updateContent = (id: string, field: string, value: string | number | boolean) => {
    setContents(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const addContent = async () => {
    const { data } = await api.post('/site/content', { key: `new_${Date.now()}`, title: 'Nuevo contenido', body: '', section: 'hero', order: 99, isActive: true });
    setContents(prev => [...prev, data]);
  };

  const deleteContent = async (id: string) => {
    await api.delete(`/site/content/${id}`);
    setContents(prev => prev.filter(i => i.id !== id));
  };

  const saveServices = async () => {
    for (const item of services) {
      await api.put(`/site/services/${item.id}`, item);
    }
    showSaved();
  };

  const addService = async () => {
    const { data } = await api.post('/site/services', { name: 'Nuevo servicio', dayOfWeek: 'Domingo', time: '10:00 AM', description: '', order: services.length + 1, isActive: true });
    setServices(prev => [...prev, data]);
  };

  const deleteService = async (id: string) => {
    await api.delete(`/site/services/${id}`);
    setServices(prev => prev.filter(i => i.id !== id));
  };

  const updateService = (id: string, field: string, value: string | number | boolean) => {
    setServices(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const filteredSettings = (group: string) => settings.filter(s => s.group === group);

  return (
    <div>
      {saved && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <FiCheck /> Guardado
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-dark text-gold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {(activeTab === 'General' || activeTab === 'Contacto' || activeTab === 'Nosotros' || activeTab === 'Pastor') && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-heading text-lg font-semibold text-gray-800 mb-6">
            {activeTab === 'General' && 'Configuración General'}
            {activeTab === 'Contacto' && 'Información de Contacto'}
            {activeTab === 'Nosotros' && 'Misión, Visión e Historia'}
            {activeTab === 'Pastor' && 'Pastor Principal'}
          </h3>
          <div className="space-y-4">
            {filteredSettings(
              activeTab === 'General' ? 'general' :
              activeTab === 'Nosotros' ? 'about' :
              activeTab === 'Contacto' ? 'contact' :
              activeTab.toLowerCase()
            ).map(s => (
              <div key={s.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{s.label || s.key}</label>
                {s.type === 'textarea' ? (
                  <textarea value={s.value} onChange={e => updateSetting(s.key, e.target.value)}
                    rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-dark focus:ring-1 focus:ring-dark/20 outline-none" />
                ) : (
                  <input type={s.type === 'image' ? 'url' : 'text'} value={s.value} onChange={e => updateSetting(s.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-dark focus:ring-1 focus:ring-dark/20 outline-none" />
                )}
              </div>
            ))}
          </div>
          <button onClick={saveSettings} className="mt-6 flex items-center gap-2 bg-dark text-gold px-6 py-2 rounded-lg hover:bg-dark-lighter transition-colors">
            <FiSave /> Guardar
          </button>
        </div>
      )}

      {activeTab === 'Menú' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-lg font-semibold text-gray-800">Items del Menú</h3>
            <button onClick={addMenuItem} className="flex items-center gap-2 bg-dark text-gold px-4 py-2 rounded-lg text-sm hover:bg-dark-lighter">
              <FiPlus /> Agregar
            </button>
          </div>
          <div className="space-y-3">
            {menuItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input type="text" value={item.label} onChange={e => updateMenuItem(item.id, 'label', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Etiqueta" />
                <input type="text" value={item.url} onChange={e => updateMenuItem(item.id, 'url', e.target.value)}
                  className="w-40 px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="URL" />
                <select value={item.location} onChange={e => updateMenuItem(item.id, 'location', e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm">
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                </select>
                <input type="number" value={item.order} onChange={e => updateMenuItem(item.id, 'order', parseInt(e.target.value))}
                  className="w-16 px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Orden" />
                <label className="flex items-center gap-1 text-sm">
                  <input type="checkbox" checked={item.isActive} onChange={e => updateMenuItem(item.id, 'isActive', e.target.checked)} />
                  Activo
                </label>
                <button onClick={() => deleteMenuItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={saveMenu} className="mt-6 flex items-center gap-2 bg-dark text-gold px-6 py-2 rounded-lg hover:bg-dark-lighter transition-colors">
            <FiSave /> Guardar todo
          </button>
        </div>
      )}

      {activeTab === 'Contenido' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-lg font-semibold text-gray-800">Contenido de Páginas</h3>
            <button onClick={addContent} className="flex items-center gap-2 bg-dark text-gold px-4 py-2 rounded-lg text-sm hover:bg-dark-lighter">
              <FiPlus /> Agregar
            </button>
          </div>
          <div className="space-y-4">
            {contents.map(item => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <input type="text" value={item.key} onChange={e => updateContent(item.id, 'key', e.target.value)}
                    className="w-48 px-3 py-1.5 border border-gray-300 rounded text-sm font-mono" placeholder="Key" />
                  <input type="text" value={item.section} onChange={e => updateContent(item.id, 'section', e.target.value)}
                    className="w-32 px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Sección" />
                  <input type="number" value={item.order} onChange={e => updateContent(item.id, 'order', parseInt(e.target.value))}
                    className="w-16 px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Orden" />
                  <label className="flex items-center gap-1 text-sm">
                    <input type="checkbox" checked={item.isActive} onChange={e => updateContent(item.id, 'isActive', e.target.checked)} />
                    Activo
                  </label>
                  <button onClick={() => deleteContent(item.id)} className="text-red-400 hover:text-red-600 p-1 ml-auto">
                    <FiTrash2 size={16} />
                  </button>
                </div>
                <input type="text" value={item.title || ''} onChange={e => updateContent(item.id, 'title', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Título" />
                <textarea value={item.body || ''} onChange={e => updateContent(item.id, 'body', e.target.value)}
                  rows={3} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Contenido" />
              </div>
            ))}
          </div>
          <button onClick={saveContent} className="mt-6 flex items-center gap-2 bg-dark text-gold px-6 py-2 rounded-lg hover:bg-dark-lighter transition-colors">
            <FiSave /> Guardar todo
          </button>
        </div>
      )}

      {activeTab === 'Servicios' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-lg font-semibold text-gray-800">Horarios de Servicios</h3>
            <button onClick={addService} className="flex items-center gap-2 bg-dark text-gold px-4 py-2 rounded-lg text-sm hover:bg-dark-lighter">
              <FiPlus /> Agregar
            </button>
          </div>
          <div className="space-y-3">
            {services.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input type="text" value={item.name} onChange={e => updateService(item.id, 'name', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Nombre" />
                <input type="text" value={item.dayOfWeek} onChange={e => updateService(item.id, 'dayOfWeek', e.target.value)}
                  className="w-28 px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Día" />
                <input type="text" value={item.time} onChange={e => updateService(item.id, 'time', e.target.value)}
                  className="w-24 px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Hora" />
                <input type="text" value={item.description || ''} onChange={e => updateService(item.id, 'description', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="Descripción" />
                <input type="number" value={item.order} onChange={e => updateService(item.id, 'order', parseInt(e.target.value))}
                  className="w-16 px-3 py-1.5 border border-gray-300 rounded text-sm" />
                <label className="flex items-center gap-1 text-sm">
                  <input type="checkbox" checked={item.isActive} onChange={e => updateService(item.id, 'isActive', e.target.checked)} />
                  Activo
                </label>
                <button onClick={() => deleteService(item.id)} className="text-red-400 hover:text-red-600 p-1">
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={saveServices} className="mt-6 flex items-center gap-2 bg-dark text-gold px-6 py-2 rounded-lg hover:bg-dark-lighter transition-colors">
            <FiSave /> Guardar todo
          </button>
        </div>
      )}
    </div>
  );
}
