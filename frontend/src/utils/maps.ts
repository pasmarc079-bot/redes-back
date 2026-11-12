export interface MapPlace {
  /** Business name as it appears on Google. */
  name?: string | null;
  /** Address as Google shows it on the profile. The pin is placed from this text. */
  address?: string | null;
}

/**
 * Search text for the map. Google places the pin reliably when the query is the business name
 * plus the address exactly as its profile lists it (the same data the profile uses).
 */
export function buildMapQuery(place: MapPlace): string {
  const name = place.name?.trim() || 'Ministerio REDES';
  const address = place.address?.trim();
  return address ? `${name}, ${address}` : `${name}, Lago Agrio, Ecuador`;
}

export function buildMapEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

/** Link that opens the same search in Google Maps. Uses the profile URL when Google provides one. */
export function buildMapLink(query: string, profileUrl?: string | null): string {
  if (profileUrl?.trim()) return profileUrl.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
