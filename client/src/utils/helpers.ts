export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateShort = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const getReadingTimeText = (minutes: number): string => {
  return `${minutes} min read`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '...';
};

export const getImageUrl = (path: string): string => {
  if (!path) return 'https://picsum.photos/seed/default/1200/800';
  if (path.startsWith('http')) return path;
  return path;
};

export const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};
