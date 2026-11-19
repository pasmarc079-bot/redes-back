import { describe, it, expect } from 'vitest';
import { DEFAULT_HERO_INTERVAL_SECONDS, DEFAULT_HERO_OVERLAY_OPACITY, MAX_HERO_INTERVAL_SECONDS, MAX_HERO_SLIDES, parseHeroSlides, parseIntervalSeconds, parseOverlayOpacity, resolveHeroSlides, safeHref, splitAccent } from '@/utils/heroSlides';

describe('heroSlides', () => {
  it('acepta una lista JSON válida', () => {
    const slides = parseHeroSlides(JSON.stringify([
      { id: 'a', title: 'Hola *Mundo*', subtitle: 'Texto', ctaLabel: 'Ir', ctaUrl: '/eventos', imageUrl: 'https://x.com/a.jpg', mobileImageUrl: '' },
    ]));
    expect(slides).toHaveLength(1);
    expect(slides[0].title).toBe('Hola *Mundo*');
    expect(slides[0].ctaUrl).toBe('/eventos');
  });

  it('descarta JSON inválido o vacío', () => {
    expect(parseHeroSlides('no json')).toEqual([]);
    expect(parseHeroSlides('')).toEqual([]);
    expect(parseHeroSlides('{"a":1}')).toEqual([]);
    expect(parseHeroSlides(undefined)).toEqual([]);
  });

  it('exige el titular y limita el número de diapositivas', () => {
    expect(parseHeroSlides(JSON.stringify([{ subtitle: 'sin título' }]))).toEqual([]);
    const many = Array.from({ length: 9 }, (_, i) => ({ id: `s${i}`, title: `T${i}` }));
    expect(parseHeroSlides(JSON.stringify(many))).toHaveLength(MAX_HERO_SLIDES);
  });

  it('descarta enlaces que no son rutas internas ni https', () => {
    expect(safeHref('/eventos')).toBe('/eventos');
    expect(safeHref('https://youtube.com/x')).toBe('https://youtube.com/x');
    expect(safeHref('javascript:alert(1)')).toBe('');
    expect(safeHref('//evil.com')).toBe('');
    expect(safeHref('data:text/html,x')).toBe('');
  });

  it('separa la palabra acentuada en dorado', () => {
    expect(splitAccent('nos une *en familia*')).toEqual([
      { text: 'nos une ', accent: false },
      { text: 'en familia', accent: true },
    ]);
  });

  it('usa el contenido de siempre cuando no hay diapositivas configuradas', () => {
    const slides = resolveHeroSlides(
      { hero_image_url: 'https://x.com/hero.jpg' },
      [{ key: 'hero_title', body: 'REDES' }, { key: 'hero_tagline', body: 'Una gran red' }],
    );
    expect(slides).toHaveLength(1);
    // Wrapped in asterisks so the brand title keeps its gold colour.
    expect(slides[0].title).toBe('*REDES*');
    expect(slides[0].subtitle).toBe('Una gran red');
    expect(slides[0].imageUrl).toBe('https://x.com/hero.jpg');
    expect(slides[0].ctaUrl).toBe('/eventos');
    expect(slides[0].secondaryCtaUrl).toBe('/nosotros');
  });

  it('mantiene el aspecto anterior en las diapositivas sin oscuridad configurada', () => {
    const [sinCampo] = parseHeroSlides(JSON.stringify([{ id: 'x', title: 'Nueva portada' }]));
    expect(sinCampo.overlayOpacity).toBe(DEFAULT_HERO_OVERLAY_OPACITY);
    expect(sinCampo.overlayOpacity).toBe(100);

    const legacy = resolveHeroSlides({}, []);
    expect(legacy[0].overlayOpacity).toBe(100);
  });

  it('lee la oscuridad de la imagen configurables', () => {
    const [slide] = parseHeroSlides(JSON.stringify([{ id: 'x', title: 'Hola', overlayOpacity: 60 }]));
    expect(slide.overlayOpacity).toBe(60);
  });

  it('prefiere las diapositivas configuradas sobre el contenido anterior', () => {
    const slides = resolveHeroSlides(
      { hero_slides: JSON.stringify([{ id: 'x', title: 'Nueva portada' }]) },
      [{ key: 'hero_title', body: 'REDES' }],
    );
    expect(slides).toHaveLength(1);
    expect(slides[0].title).toBe('Nueva portada');
  });
});

describe('parseIntervalSeconds', () => {
  it('usa el valor configurado', () => {
    expect(parseIntervalSeconds('12')).toBe(12);
  });

  it('usa el valor por defecto si no hay nada configurado', () => {
    expect(parseIntervalSeconds(undefined)).toBe(DEFAULT_HERO_INTERVAL_SECONDS);
    expect(parseIntervalSeconds('')).toBe(DEFAULT_HERO_INTERVAL_SECONDS);
    expect(parseIntervalSeconds('   ')).toBe(DEFAULT_HERO_INTERVAL_SECONDS);
    expect(parseIntervalSeconds('no es un numero')).toBe(DEFAULT_HERO_INTERVAL_SECONDS);
  });

  it('acepta cero para no rotar solo y limita el maximo', () => {
    expect(parseIntervalSeconds('0')).toBe(0);
    expect(parseIntervalSeconds(String(MAX_HERO_INTERVAL_SECONDS + 10))).toBe(MAX_HERO_INTERVAL_SECONDS);
    expect(parseIntervalSeconds('-5')).toBe(0);
  });

  it('redondea hacia abajo los decimales', () => {
    expect(parseIntervalSeconds('7.9')).toBe(7);
  });
});

describe('parseOverlayOpacity', () => {
  it('usa 100 cuando no hay valor guardado', () => {
    expect(parseOverlayOpacity(undefined)).toBe(100);
    expect(parseOverlayOpacity(null)).toBe(100);
    expect(parseOverlayOpacity('')).toBe(100);
    expect(parseOverlayOpacity('no es un numero')).toBe(100);
  });

  it('acepta valores entre 0 y 100 y redondea', () => {
    expect(parseOverlayOpacity(0)).toBe(0);
    expect(parseOverlayOpacity('45')).toBe(45);
    expect(parseOverlayOpacity(62.6)).toBe(63);
  });

  it('limita los valores fuera de rango', () => {
    expect(parseOverlayOpacity(-20)).toBe(0);
    expect(parseOverlayOpacity(180)).toBe(100);
  });
});
