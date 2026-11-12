import { SITE_PAGES } from '@/config/sitePages';

interface PageLinkFieldProps {
  id: string;
  label: string;
  /** Current destination: one of the site routes or a full URL. */
  value: string;
  onChange: (url: string) => void;
  help?: string;
  placeholder?: string;
}

/**
 * Picks where a button sends the visitor. The pages of the site come first so nobody has to
 * remember or type a route; "Otro enlace…" opens a field for links outside the site.
 */
export default function PageLinkField({
  id,
  label,
  value,
  onChange,
  help,
  placeholder = 'https://ejemplo.com',
}: PageLinkFieldProps) {
  const knownPage = SITE_PAGES.find((page) => page.url === value);
  const isExternal = !knownPage;

  return (
    <div className="field-group">
      <label className="label" htmlFor={id}>{label}</label>
      {help && <p className="mb-2 text-xs text-gray-500">{help}</p>}

      <select
        id={id}
        className="select w-full"
        value={knownPage?.url ?? ''}
        onChange={(event) => onChange(event.target.value)}
      >
        {SITE_PAGES.map((page) => (
          <option key={page.id} value={page.url}>{page.label}</option>
        ))}
        <option value="">Otro enlace…</option>
      </select>

      {isExternal && (
        <>
          <input
            type="url"
            className="input mt-2 w-full"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            aria-label={`${label}: enlace completo`}
          />
          <p className="mt-1 text-xs text-gray-500">
            Escribe el enlace completo. Ejemplo: https://www.youtube.com/@ministerioredes
          </p>
        </>
      )}

      {knownPage && (
        <p className="mt-1 text-xs text-gray-500">Se abrirá la página de {knownPage.label}.</p>
      )}
    </div>
  );
}
