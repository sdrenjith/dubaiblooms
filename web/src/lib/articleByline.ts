export function formatArticleByline(item: {
  author?: { name?: string } | null;
  publishedAt?: string | null;
}): string {
  const author = item.author?.name?.trim();
  const publishedLabel = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  return [author ? `By ${author}` : null, publishedLabel || null].filter(Boolean).join(' • ');
}
