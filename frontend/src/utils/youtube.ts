const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/** Mirrors the backend helper: extracts the 11-char id from watch/short/embed/youtu.be URLs. */
export function extractYouTubeId(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www\.|m\.)/, '');
  let id: string | null = null;

  if (host === 'youtu.be') {
    id = url.pathname.split('/')[1] || null;
  } else if (host === 'youtube.com') {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else {
      const match = url.pathname.match(/^\/(shorts|embed|live)\/([^/?#]+)/);
      id = match ? match[2] : null;
    }
  }

  return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
}
