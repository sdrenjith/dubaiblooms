/**
 * When the SPA is served from a different origin than the API (e.g. `VITE_API_URL=https://api.example.com/api`),
 * relative `/uploads/...` paths would hit the frontend host and 404. In that case, prefix with the API origin.
 */
/** Paths that must never be used as `<img src>` (local machine paths, wrong schemes). */
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
  const raw = import.meta.env.VITE_API_URL?.trim();
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

/** Normalize stored image paths (relative `/uploads/...`, bare paths, or absolute URLs) for `<img src>`. */
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
