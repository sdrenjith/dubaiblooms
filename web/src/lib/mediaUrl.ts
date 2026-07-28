function isUnusableBrowserImageRef(raw: string): boolean {
  const t = raw.trim();
  if (!t) {
    return true;
  }
  if (/^file:/i.test(t) || /^\/file:/i.test(t)) {
    return true;
  }
  if (/^[a-z]:[\\/]/i.test(t)) {
    return true;
  }
  if (/^\\\\/.test(t)) {
    return true;
  }
  if (t.includes('://') && !/^https?:\/\//i.test(t)) {
    return true;
  }
  return false;
}

function apiServerOriginFromEnv(): string | null {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw || !/^https?:\/\//i.test(raw)) {
    return null;
  }
  const noTrail = raw.replace(/\/+$/, '');
  const baseForOrigin = noTrail.endsWith('/api') ? noTrail.slice(0, -4) : noTrail;
  try {
    return new URL(baseForOrigin).origin;
  } catch {
    return null;
  }
}

export function resolveMediaSrc(image?: string | null): string {
  if (!image?.trim()) {
    return '';
  }
  const t = image.trim();
  if (isUnusableBrowserImageRef(t)) {
    return '';
  }
  if (/^https?:\/\//i.test(t)) {
    return t;
  }
  const path = t.startsWith('/') ? t : `/${t}`;
  const withCacheBuster = (u: string) => (u.includes('?') ? u : `${u}?v=logo2`);
  const origin = apiServerOriginFromEnv();
  if (origin && path.startsWith('/uploads')) {
    return withCacheBuster(`${origin}${path}`);
  }
  if (path.startsWith('/uploads')) {
    return withCacheBuster(path);
  }
  return path;
}

export function absoluteUrl(pathOrUrl: string, base = process.env.NEXT_PUBLIC_SITE_URL || 'https://dubaiblooms.ae'): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base.replace(/\/+$/, '')}${path}`;
}
