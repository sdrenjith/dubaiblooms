/**
 * Article `content` may be real HTML (from seed / editors) or plain text with
 * newlines from the admin textarea. Plain text must be turned into `<p>` / `<br>`
 * so the public page preserves paragraphs and line breaks.
 */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Inner HTML of a single root `<p>…</p>` wrapper (common when pasting into a field
 * that adds a paragraph tag). Returns null if the string is not exactly one outer `p`.
 */
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

/** True if `s` still contains any HTML tag after optional `<br>` normalization. */
function hasNonBrHtmlTags(s: string): boolean {
  const withoutBr = s.replace(/<br\s*\/?>/gi, '');
  return /<[a-z][\w.-]*/i.test(withoutBr);
}

/** True when the string already looks like authored HTML — leave it unchanged. */
export function looksLikeArticleHtml(raw: string): boolean {
  const s = raw.trim();
  if (s.length === 0) {
    return false;
  }
  if (s.startsWith('<!')) {
    return true;
  }
  if (s.startsWith('</')) {
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

/** Convert plain text to safe HTML: blank lines → new paragraphs, single newlines → `<br>`. */
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
  if (parts.length === 0) {
    return '<p></p>';
  }
  return parts.join('');
}

/** HTML suitable for `dangerouslySetInnerHTML` on the article page. */
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
