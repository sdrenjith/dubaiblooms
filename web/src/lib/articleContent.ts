export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function unwrapOuterSingleParagraphP(html: string): string | null {
  const t = html.trim();
  const m = /^<p(\s[^>]*)?>([\s\S]*)<\/p>\s*$/i.exec(t);
  if (!m) {
    return null;
  }
  const inner = m[2];
  if (/<\/?p\b/i.test(inner)) {
    return null;
  }
  return inner;
}

function brTagsToNewlines(s: string): string {
  return s.replace(/<br\s*\/?>/gi, '\n');
}

function hasNonBrHtmlTags(s: string): boolean {
  const withoutBr = s.replace(/<br\s*\/?>/gi, '');
  return /<[a-z][\w.-]*/i.test(withoutBr);
}

export function looksLikeArticleHtml(raw: string): boolean {
  const s = raw.trim();
  if (s.length === 0) {
    return false;
  }
  if (s.startsWith('<!') || s.startsWith('</')) {
    return true;
  }
  if (/^<[a-z][\w-]*(\s|\/>|>)/i.test(s)) {
    return true;
  }
  if (/<\/(p|div|h[1-6]|ul|ol|li|section|blockquote|table|figure)\b/i.test(s)) {
    return true;
  }
  if (/<(br|img|a|strong|em|b|i|span|ul|ol|li|table|thead|tbody|tr|td|th)\b/i.test(s)) {
    return true;
  }
  return false;
}

export function plainTextArticleBodyToHtml(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\n+/);
  const parts: string[] = [];
  for (const block of blocks) {
    const inner = block.replace(/^\n+|\n+$/g, '');
    if (inner.length === 0) {
      continue;
    }
    const withBreaks = inner.split('\n').map((line) => escapeHtml(line)).join('<br />');
    parts.push(`<p>${withBreaks}</p>`);
  }
  return parts.length === 0 ? '<p></p>' : parts.join('');
}

export function prepareArticleBodyHtml(content: string | undefined | null): string {
  const raw = (content ?? '').trim();
  if (!raw) {
    return '';
  }

  const singlePInner = unwrapOuterSingleParagraphP(raw);
  if (singlePInner !== null) {
    const asText = brTagsToNewlines(singlePInner);
    if (!hasNonBrHtmlTags(asText)) {
      return plainTextArticleBodyToHtml(asText);
    }
  }

  if (looksLikeArticleHtml(raw)) {
    return raw;
  }
  return plainTextArticleBodyToHtml(raw);
}
