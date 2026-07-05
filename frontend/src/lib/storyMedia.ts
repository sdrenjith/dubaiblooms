import type { StoryMediaItem } from '@/types/api';

const VIDEO_EXT = /\.(mp4|webm|mov|ogg|m4v)(\?|$)/i;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif)(\?|$)/i;
const YOUTUBE_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/i;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?\d+/i;

export function inferMediaType(url: string): 'image' | 'video' {
  const t = url.trim();
  if (!t) {
    return 'image';
  }
  if (YOUTUBE_RE.test(t) || VIMEO_RE.test(t) || VIDEO_EXT.test(t)) {
    return 'video';
  }
  if (IMAGE_EXT.test(t)) {
    return 'image';
  }
  return 'image';
}

export function normalizeStoryMedia(raw: StoryMediaItem[] | undefined | null): StoryMediaItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const seen = new Set<string>();
  const items: StoryMediaItem[] = [];

  raw.forEach((item, index) => {
    const url = (item?.url || '').trim();
    if (!url || seen.has(url)) {
      return;
    }
    seen.add(url);
    items.push({
      url,
      type: item.type === 'video' || item.type === 'image' ? item.type : inferMediaType(url),
      alt: (item.alt || '').trim().slice(0, 200),
      order: typeof item.order === 'number' ? item.order : index,
    });
  });

  return items
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 30)
    .map((item, index) => ({ ...item, order: index }));
}

export function isEmbeddableVideoUrl(url: string): boolean {
  return YOUTUBE_RE.test(url) || VIMEO_RE.test(url);
}

export function embedVideoUrl(url: string): string {
  const t = url.trim();
  if (YOUTUBE_RE.test(t)) {
    const match =
      t.match(/[?&]v=([^&]+)/) ||
      t.match(/youtu\.be\/([^?&]+)/) ||
      t.match(/embed\/([^?&]+)/) ||
      t.match(/shorts\/([^?&]+)/);
    const id = match?.[1];
    if (id) {
      return `https://www.youtube.com/embed/${id}`;
    }
  }
  if (VIMEO_RE.test(t)) {
    const match = t.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    const id = match?.[1];
    if (id) {
      return `https://player.vimeo.com/video/${id}`;
    }
  }
  return t;
}

export function sortedStoryMedia(article: { media?: StoryMediaItem[] | null }): StoryMediaItem[] {
  return normalizeStoryMedia(article.media);
}
