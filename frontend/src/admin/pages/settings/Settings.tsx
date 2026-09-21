import { useEffect, useMemo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiEdit3, FiImage, FiLink, FiMenu, FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import { showToast } from '@/admin/components/ui/Toast';
import MediaPicker from '@/admin/components/ui/MediaPicker';
import { siteApi, socialApi } from '@/services/api';

type PageId = 'home' | 'about' | 'events' | 'blog' | 'community' | 'contact';
type FieldSource = 'content' | 'setting';
type FieldType = 'text' | 'textarea' | 'image' | 'boolean';

interface SiteSetting {
  key: string;
  value: string;
}

interface MenuItem {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
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

interface SocialConfig {
  id?: string;
  platform: string;
  accountUrl: string | null;
  feedUrl: string | null;
  iconName: string | null;
  color: string | null;
  order: number;
  isActive: boolean;
}

interface PageField {
  key: string;
  label: string;
  source: FieldSource;
  type: FieldType;
  help?: string;
}

interface PageDefinition {
  id: PageId;
  label: string;
  description: string;
  url: string;
  fields: PageField[];
}

const pages: PageDefinition[] = [
  {
    id: 'home',
    label: 'Inicio',
    description: 'Presenta el ministerio y dirige a los visitantes a las secciones principales.',
    url: '/',
    fields: [
      { key: 'hero_title', label: 'Título principal de portada', source: 'content', type: 'text' },
      { key: 'hero_subtitle', label: 'Subtítulo', source: 'content', type: 'text' },
      { key: 'hero_tagline', label: 'Eslogan', source: 'content', type: 'textarea' },
      { key: 'hero_image_url', label: 'Imagen que se muestra para computadores', source: 'setting', type: 'image' },
      { key: 'hero_image_mobile_url', label: 'Imagen para dispositivos móviles', source: 'setting', type: 'image' },
      { key: 'home_social_enabled', label: 'Mostrar sección "Nuestras Redes"', source: 'setting', type: 'boolean' },
    ],
  },
  {
    id: 'about',
    label: 'Nosotros',
    description: 'Cuenta quiénes somos, nuestra historia, misión y visión.',
    url: '/nosotros',
    fields: [
      { key: 'about_page_title', label: 'Título principal', source: 'content', type: 'text' },
      { key: 'about_cover_image_url', label: 'Imagen que se muestra para computadores', source: 'setting', type: 'image' },
      { key: 'about_cover_image_mobile_url', label: 'Imagen para dispositivos móviles', source: 'setting', type: 'image' },
      { key: 'about_intro', label: 'Historia / Introducción', source: 'content', type: 'textarea' },
      { key: 'church_history', label: 'Historia del ministerio', source: 'setting', type: 'textarea' },
      { key: 'mission', label: 'Misión', source: 'setting', type: 'textarea' },
      { key: 'vision', label: 'Visión', source: 'setting', type: 'textarea' },
      { key: 'pastor_photo_url', label: 'Imagen representativa / pastor', source: 'setting', type: 'image' },
    ],
  },
  {
    id: 'events',
    label: 'Eventos',
    description: 'Presenta el encabezado de la sección de eventos.',
    url: '/eventos',
      fields: [
        { key: 'events_page_title', label: 'Título de la página', source: 'content', type: 'text' },
        { key: 'events_page_description', label: 'Texto introductorio', source: 'content', type: 'textarea' },
        { key: 'events_cover_image_url', label: 'Imagen que se muestra para computadores', source: 'setting', type: 'image' },
        { key: 'events_cover_image_mobile_url', label: 'Imagen para dispositivos móviles', source: 'setting', type: 'image' },
    ],
  },
  {
    id: 'blog',
    label: 'Blog',
    description: 'Presenta el encabezado de artículos, reflexiones y noticias.',
    url: '/blog',
      fields: [
        { key: 'blog_page_title', label: 'Título de la página', source: 'content', type: 'text' },
        { key: 'blog_page_description', label: 'Texto introductorio', source: 'content', type: 'textarea' },
        { key: 'blog_cover_image_url', label: 'Imagen que se muestra para computadores', source: 'setting', type: 'image' },
        { key: 'blog_cover_image_mobile_url', label: 'Imagen para dispositivos móviles', source: 'setting', type: 'image' },
    ],
  },
  {
    id: 'community',
    label: 'Comunidad',
    description: 'Invita a las personas a conectarse con la comunidad REDES.',
    url: '/comunidad',
      fields: [
        { key: 'community_page_title', label: 'Título de la página', source: 'content', type: 'text' },
        { key: 'community_page_description', label: 'Texto introductorio', source: 'content', type: 'textarea' },
        { key: 'community_cover_image_url', label: 'Imagen que se muestra para computadores', source: 'setting', type: 'image' },
        { key: 'community_cover_image_mobile_url', label: 'Imagen para dispositivos móviles', source: 'setting', type: 'image' },
    ],
  },
  {
    id: 'contact',
    label: 'Contacto',
    description: 'Muestra cómo visitar y comunicarse con el ministerio.',
    url: '/contacto',
      fields: [
        { key: 'contact_welcome', label: 'Mensaje de bienvenida', source: 'content', type: 'text' },
        { key: 'contact_cover_image_url', label: 'Imagen que se muestra para computadores', source: 'setting', type: 'image' },
        { key: 'contact_cover_image_mobile_url', label: 'Imagen para dispositivos móviles', source: 'setting', type: 'image' },
      ],
  },
];

const pageById = Object.fromEntries(pages.map(page => [page.id, page])) as Record<PageId, PageDefinition>;

export default function Settings() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [contents, setContents] = useState<PageContent[]>([]);
  const [socials, setSocials] = useState<SocialConfig[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageId | null>(null);
  const [activeSection, setActiveSection] = useState<'pages' | 'external'>('pages');
  const [savingPage, setSavingPage] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);
  const [savingExternal, setSavingExternal] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [imageFieldKey, setImageFieldKey] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      siteApi.getSettingsFull(),
      siteApi.getMenuAll(),
      siteApi.getContentAll(),
      socialApi.getAdminConfigs(),
    ]).then(([settingsResponse, menuResponse, contentResponse, socialResponse]) => {
      setSettings(settingsResponse.data);
      setMenuItems(menuResponse.data);
      setContents(contentResponse.data);
      setSocials(socialResponse.data);
    }).catch(() => showToast('error', 'No se pudo cargar la configuración de páginas.'));
  }, []);

  const headerItems = useMemo(
    () => menuItems.filter(item => item.location === 'header').sort((a, b) => a.order - b.order),
    [menuItems],
  );

  const orderedPages = useMemo(() => {
    const orderByUrl = new Map(headerItems.map(item => [item.url, item.order]));
    return [...pages].sort((a, b) => (orderByUrl.get(a.url) ?? 999) - (orderByUrl.get(b.url) ?? 999));
  }, [headerItems]);

  const getSetting = (key: string) => settings.find(item => item.key === key)?.value || '';
  const getContent = (key: string) => contents.find(item => item.key === key);
  const getFieldValue = (field: PageField) => field.source === 'setting'
    ? getSetting(field.key)
    : getContent(field.key)?.body || '';

  const updateSetting = (key: string, value: string) => {
    setSettings(current => current.map(item => item.key === key ? { ...item, value } : item));
  };

  const updateContent = (key: string, value: string) => {
    setContents(current => current.map(item => item.key === key ? { ...item, body: value } : item));
  };

  const updateField = (field: PageField, value: string) => {
    if (field.source === 'setting') updateSetting(field.key, value);
    else updateContent(field.key, value);
  };

  const savePage = async (page: PageDefinition) => {
    setSavingPage(true);
    try {
      const pageFields = new Set(page.fields.map(field => field.key));
      const pageSettings = Object.fromEntries(
        settings.filter(item => pageFields.has(item.key)).map(item => [item.key, item.value]),
      );
      const pageContent = contents
        .filter(item => pageFields.has(item.key))
        .map(item => ({ key: item.key, body: item.body }));

      await siteApi.updatePage(page.id, { settings: pageSettings, content: pageContent });
      showToast('success', `Contenido de ${page.label} guardado.`);
      setSelectedPage(null);
    } catch {
      showToast('error', `No se pudo guardar ${page.label}.`);
    } finally {
      setSavingPage(false);
    }
  };

  const setPageActive = (page: PageDefinition, isActive: boolean) => {
    setMenuItems(current => current.map(item => item.location === 'header' && item.url === page.url
      ? { ...item, isActive }
      : item));
  };

  const movePage = (page: PageDefinition, direction: -1 | 1) => {
    const currentIndex = orderedPages.findIndex(item => item.id === page.id);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= orderedPages.length) return;

    const nextPages = [...orderedPages];
    [nextPages[currentIndex], nextPages[targetIndex]] = [nextPages[targetIndex], nextPages[currentIndex]];
    setMenuItems(current => current.map(item => {
      const nextOrder = nextPages.findIndex(nextPage => nextPage.url === item.url);
      return item.location === 'header' && nextOrder >= 0 ? { ...item, order: nextOrder + 1 } : item;
    }));
  };

  const dropPage = (event: React.DragEvent, targetPage: PageDefinition) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/page-id') as PageId;
    const sourcePage = pageById[sourceId];
    if (!sourcePage || sourcePage.id === targetPage.id) return;

    const sourceIndex = orderedPages.findIndex(page => page.id === sourcePage.id);
    const targetIndex = orderedPages.findIndex(page => page.id === targetPage.id);
    const nextPages = [...orderedPages];
    nextPages.splice(sourceIndex, 1);
    nextPages.splice(targetIndex, 0, sourcePage);
    setMenuItems(current => current.map(item => {
      const nextOrder = nextPages.findIndex(page => page.url === item.url);
      return item.location === 'header' && nextOrder >= 0 ? { ...item, order: nextOrder + 1 } : item;
    }));
  };

  const saveMenuOrder = async () => {
    setSavingMenu(true);
    try {
      await siteApi.updateMenuBatch(headerItems.map(item => ({ id: item.id, order: item.order, isActive: item.isActive })));
      showToast('success', 'Orden y visibilidad del menú guardados.');
    } catch {
      showToast('error', 'No se pudo guardar el menú.');
    } finally {
      setSavingMenu(false);
    }
  };

  const updateSocial = (index: number, field: keyof SocialConfig, value: string | boolean | number) => {
    setSocials(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  const addSocial = () => {
    setSocials(current => [...current, {
      platform: 'facebook',
      accountUrl: '',
      feedUrl: null,
      iconName: 'FiFacebook',
      color: '#1877F2',
      order: current.length + 1,
      isActive: true,
    }]);
  };

  const removeSocial = (id: string | undefined) => {
    setSocials(current => current.filter(item => item.id !== id));
  };

  const moveSocial = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= socials.length) return;
    setSocials(current => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, itemIndex) => ({ ...item, order: itemIndex + 1 }));
    });
  };

  const saveExternal = async () => {
    setSavingExternal(true);
    try {
      const contactKeys = new Set(['phone', 'phone_international', 'whatsapp_number', 'whatsapp_message', 'email', 'address', 'google_maps_url', 'donation_url', 'external_form_url']);
      const contactSettings = Object.fromEntries(settings.filter(item => contactKeys.has(item.key)).map(item => [item.key, item.value]));
      const savedSocials = await Promise.all([
        siteApi.updateSettings(contactSettings),
        socialApi.updateBatch(socials.map((item, index) => ({ ...item, order: index + 1 }))),
      ]);
      setSocials(savedSocials[1].data);
      showToast('success', 'Enlaces externos y contacto guardados.');
    } catch {
      showToast('error', 'No se pudo guardar la configuración global.');
    } finally {
      setSavingExternal(false);
    }
  };

  const selectedDefinition = selectedPage ? pageById[selectedPage] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4" role="tablist" aria-label="Configuración del sitio">
        <button type="button" role="tab" aria-selected={activeSection === 'pages'} onClick={() => setActiveSection('pages')} className={`tab ${activeSection === 'pages' ? 'tab-active' : 'tab-inactive'}`}>Configuración de Páginas</button>
        <button type="button" role="tab" aria-selected={activeSection === 'external'} onClick={() => setActiveSection('external')} className={`tab ${activeSection === 'external' ? 'tab-active' : 'tab-inactive'}`}>Enlaces Externos y Contacto</button>
      </div>

      {activeSection === 'pages' ? (
      <>
      <div>
        <h3 className="font-heading text-2xl font-semibold text-gray-800">Configuración de Páginas</h3>
        <p className="mt-1 max-w-3xl text-sm text-gray-500">Ordena las páginas del menú y edita textos e imágenes. Los datos de contacto y enlaces externos se administran en su sección central.</p>
      </div>

      <section className="card card-body">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="font-heading text-lg font-semibold text-gray-800">Orden de menú y páginas</h4>
            <p className="mt-1 text-sm text-gray-500">Arrastra una página o usa las flechas para cambiar su posición.</p>
          </div>
          <button type="button" onClick={saveMenuOrder} disabled={savingMenu} className="btn btn-primary">
            <FiSave /> {savingMenu ? 'Guardando...' : 'Guardar orden del menú'}
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {orderedPages.map((page, index) => {
            const menuItem = headerItems.find(item => item.url === page.url);
            const isActive = menuItem?.isActive ?? true;
            return (
              <div
                key={page.id}
                draggable
                onDragStart={event => event.dataTransfer.setData('text/page-id', page.id)}
                onDragOver={event => event.preventDefault()}
                onDrop={event => dropPage(event, page)}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-gold/60 hover:bg-white md:flex-row md:items-center"
              >
                <div className="flex items-center gap-3 md:w-10">
                  <button type="button" className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-700" aria-label={`Arrastrar ${page.label}`}>
                    <FiMenu size={19} />
                  </button>
                  <span className="text-sm font-semibold text-gray-400 md:hidden">{index + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h5 className="font-heading font-semibold text-gray-800">{page.label}</h5>
                    <span className="hidden text-xs text-gray-400 sm:inline">Página fija</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{page.description}</p>
                </div>
                <div className="flex items-center justify-between gap-2 md:justify-end">
                  <label className="flex min-h-11 items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={event => setPageActive(page, event.target.checked)}
                      className="rounded border-gray-300 text-gold focus:ring-gold/20"
                    />
                    Visible en menú
                  </label>
                  <div className="flex items-center">
                    <button type="button" onClick={() => movePage(page, -1)} disabled={index === 0} className="min-h-11 min-w-11 rounded-lg text-gray-500 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Subir ${page.label}`}><FiChevronUp /></button>
                    <button type="button" onClick={() => movePage(page, 1)} disabled={index === orderedPages.length - 1} className="min-h-11 min-w-11 rounded-lg text-gray-500 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Bajar ${page.label}`}><FiChevronDown /></button>
                  </div>
                  <button type="button" onClick={() => setSelectedPage(page.id)} className="btn btn-secondary whitespace-nowrap">
                    <FiEdit3 /> Editar Contenido
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedDefinition && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="page-editor-title">
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-dark">Configuración de página</p>
                <h4 id="page-editor-title" className="mt-1 font-heading text-xl font-semibold text-gray-800">{selectedDefinition.label}</h4>
                <p className="mt-1 text-sm text-gray-500">Edita únicamente lo que verán los visitantes.</p>
              </div>
              <button type="button" onClick={() => setSelectedPage(null)} className="min-h-11 min-w-11 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Cerrar editor"><FiX size={21} /></button>
            </div>
            <div className="space-y-5 px-5 py-6 sm:px-7">
              {selectedDefinition.fields.map(field => (
                <div key={field.key} className="field-group">
                  <label className="label" htmlFor={`page-field-${field.key}`}>{field.label}</label>
                  {field.help && <p className="mb-2 text-xs text-gray-500">{field.help}</p>}
                  {field.type === 'image' ? (
                    <div className="space-y-3">
                      {getFieldValue(field) ? (
                        <img src={getFieldValue(field)} alt={field.label} className="h-44 w-full rounded-xl border border-gray-200 bg-gray-50 object-contain" />
                      ) : (
                        <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">No hay imagen seleccionada</div>
                      )}
                      <button type="button" className="btn btn-secondary" onClick={() => { setImageFieldKey(field.key); setMediaPickerOpen(true); }}>
                        <FiImage /> Elegir de la biblioteca
                      </button>
                      {getFieldValue(field) && <button type="button" className="ml-2 min-h-11 rounded-lg px-3 text-sm text-red-500 hover:bg-red-50" onClick={() => updateSetting(field.key, '')}><FiTrash2 className="inline" /> Quitar imagen</button>}
                    </div>
                  ) : field.type === 'boolean' ? (
                    <label className="flex min-h-11 items-center gap-3 text-sm text-gray-700">
                      <input id={`page-field-${field.key}`} type="checkbox" checked={getFieldValue(field) !== 'false'} onChange={event => updateField(field, String(event.target.checked))} className="rounded border-gray-300 text-gold focus:ring-gold/20" />
                      Sí, mostrar esta sección en Inicio
                    </label>
                  ) : field.type === 'textarea' ? (
                    <textarea id={`page-field-${field.key}`} value={getFieldValue(field)} onChange={event => updateField(field, event.target.value)} rows={5} className="textarea w-full" />
                  ) : (
                    <input id={`page-field-${field.key}`} type="text" value={getFieldValue(field)} onChange={event => updateField(field, event.target.value)} className="input w-full" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
              <button type="button" onClick={() => setSelectedPage(null)} className="btn btn-secondary">Cancelar</button>
              <button type="button" onClick={() => savePage(selectedDefinition)} disabled={savingPage} className="btn btn-primary"><FiSave /> {savingPage ? 'Guardando...' : 'Guardar cambios'}</button>
            </div>
          </div>
        </div>
      )}

      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => { setMediaPickerOpen(false); setImageFieldKey(null); }}
        onSelect={url => {
          if (imageFieldKey) updateSetting(imageFieldKey, url);
          setMediaPickerOpen(false);
          setImageFieldKey(null);
        }}
      />
      </>
      ) : (
        <ExternalContactSettings
          settings={settings}
          socials={socials}
          updateSetting={updateSetting}
          updateSocial={updateSocial}
          addSocial={addSocial}
          removeSocial={removeSocial}
          moveSocial={moveSocial}
          saveExternal={saveExternal}
          saving={savingExternal}
        />
      )}
    </div>
  );
}

interface ExternalContactSettingsProps {
  settings: SiteSetting[];
  socials: SocialConfig[];
  updateSetting: (key: string, value: string) => void;
  updateSocial: (index: number, field: keyof SocialConfig, value: string | boolean | number) => void;
  addSocial: () => void;
  removeSocial: (id: string | undefined) => void;
  moveSocial: (index: number, direction: -1 | 1) => void;
  saveExternal: () => Promise<void>;
  saving: boolean;
}

function ExternalContactSettings({ settings, socials, updateSetting, updateSocial, addSocial, removeSocial, moveSocial, saveExternal, saving }: ExternalContactSettingsProps) {
  const getSetting = (key: string) => settings.find(item => item.key === key)?.value || '';
  const contactFields = [
    ['phone', 'Teléfono oficial', 'text'],
    ['phone_international', 'Teléfono para enlaces', 'text'],
    ['whatsapp_number', 'WhatsApp oficial', 'text'],
    ['email', 'Correo electrónico institucional', 'email'],
    ['address', 'Dirección física completa', 'textarea'],
    ['google_maps_url', 'Enlace de Google Maps', 'url'],
    ['external_form_url', 'Formulario externo', 'url'],
    ['donation_url', 'Enlace de donaciones', 'url'],
    ['whatsapp_message', 'Mensaje predeterminado de WhatsApp', 'textarea'],
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-2xl font-semibold text-gray-800">Enlaces Externos y Contacto</h3>
        <p className="mt-1 max-w-3xl text-sm text-gray-500">Administra aquí la información institucional y los canales oficiales. Estos datos se reflejan automáticamente en todo el sitio.</p>
      </div>

      <section className="card card-body">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="font-heading text-lg font-semibold text-gray-800">Redes sociales centralizadas</h4>
            <p className="mt-1 text-sm text-gray-500">El orden y la visibilidad se aplican en Inicio, Comunidad y el pie de página.</p>
          </div>
          <button type="button" onClick={addSocial} className="btn btn-secondary"><FiPlus /> Agregar red</button>
        </div>
        <div className="mt-5 space-y-3">
          {socials.map((social, index) => (
            <div key={social.id || `new-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[auto_170px_1fr_auto_auto]">
                <button type="button" className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200" aria-label={`Ordenar ${social.platform}`}><FiMenu /></button>
                <div><label className="label" htmlFor={`social-platform-${index}`}>Plataforma</label><select id={`social-platform-${index}`} value={social.platform} onChange={event => updateSocial(index, 'platform', event.target.value)} className="select"><option value="facebook">Facebook</option><option value="youtube">YouTube</option><option value="tiktok">TikTok</option><option value="instagram">Instagram</option><option value="whatsapp">WhatsApp</option><option value="twitter">X / Twitter</option><option value="telegram">Telegram</option></select></div>
                <div><label className="label" htmlFor={`social-url-${index}`}>Enlace público</label><input id={`social-url-${index}`} type="url" value={social.accountUrl || ''} onChange={event => updateSocial(index, 'accountUrl', event.target.value)} className="input" placeholder="https://..." /></div>
                <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={social.isActive} onChange={event => updateSocial(index, 'isActive', event.target.checked)} className="rounded border-gray-300 text-gold focus:ring-gold/20" />Activo</label>
                <button type="button" onClick={() => removeSocial(social.id)} className="min-h-11 min-w-11 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600" aria-label={`Eliminar ${social.platform}`}><FiTrash2 /></button>
              </div>
              <div className="mt-2 flex justify-end gap-1"><button type="button" onClick={() => moveSocial(index, -1)} disabled={index === 0} className="min-h-9 min-w-9 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30" aria-label={`Subir ${social.platform}`}><FiChevronUp /></button><button type="button" onClick={() => moveSocial(index, 1)} disabled={index === socials.length - 1} className="min-h-9 min-w-9 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30" aria-label={`Bajar ${social.platform}`}><FiChevronDown /></button></div>
            </div>
          ))}
        </div>
      </section>

      <section className="card card-body">
        <div className="mb-5 border-b border-gray-100 pb-5"><h4 className="font-heading text-lg font-semibold text-gray-800">Contacto e identidad global</h4><p className="mt-1 text-sm text-gray-500">Esta información se reutiliza en Contacto, Comunidad, Inicio y el pie de página.</p></div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {contactFields.map(([key, label, type]) => (
            <div key={key} className={type === 'textarea' ? 'field-group md:col-span-2' : 'field-group'}>
              <label className="label" htmlFor={`global-${key}`}>{label}</label>
              {type === 'textarea' ? <textarea id={`global-${key}`} value={getSetting(key)} onChange={event => updateSetting(key, event.target.value)} rows={4} className="textarea w-full" /> : <input id={`global-${key}`} type={type} value={getSetting(key)} onChange={event => updateSetting(key, event.target.value)} className="input w-full" />}
            </div>
          ))}
        </div>
        <p className="mt-4 flex items-start gap-2 text-xs text-gray-500"><FiLink className="mt-0.5 shrink-0" />Los enlaces de Google Maps, donaciones y formularios son opcionales; si están vacíos, no se muestran.</p>
        <button type="button" onClick={saveExternal} disabled={saving} className="btn btn-primary mt-6"><FiSave /> {saving ? 'Guardando...' : 'Guardar enlaces y contacto'}</button>
      </section>
    </div>
  );
}
