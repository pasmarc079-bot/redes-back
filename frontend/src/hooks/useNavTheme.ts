import { useEffect, useState } from 'react';

export type NavTheme = 'dark' | 'light';

export function useNavTheme(): NavTheme {
  const [theme, setTheme] = useState<NavTheme>('dark');

  useEffect(() => {
    const sections = document.querySelectorAll('[data-nav-theme]');
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const t = visible[0].target.getAttribute('data-nav-theme') as NavTheme | null;
          if (t) setTheme(t);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return theme;
}
