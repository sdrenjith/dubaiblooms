import { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi } from '@/lib/api';
import type { Article } from '@/types/api';

type StoryStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useStoryEditors(
  token: string | null,
  baselineArticles: Article[],
  showFeaturedCheckbox: boolean,
  onSaved?: (updated: Article) => void
) {
  const [editedStories, setEditedStories] = useState<Article[]>([]);
  const [storyStatuses, setStoryStatuses] = useState<Record<string, StoryStatus>>({});
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  useEffect(() => {
    setEditedStories(baselineArticles.map((a) => ({ ...a })));
    setStoryStatuses({});
  }, [baselineArticles]);

  const updateStoryField = useCallback((id: string, patch: Partial<Article>) => {
    setEditedStories((prev) => prev.map((x) => (x._id === id ? { ...x, ...patch } : x)));
  }, []);

  const saveStory = useCallback(
    async (id: string) => {
      if (!token) {
        return;
      }
      const row = editedStories.find((x) => x._id === id);
      if (!row) {
        return;
      }
      const fallbackImage = (baselineArticles.find((x) => x._id === id)?.featuredImage || '').trim();
      const imageUrl = (row.featuredImage || '').trim() || fallbackImage;
      if (!imageUrl) {
        setStoryStatuses((m) => ({ ...m, [id]: 'error' }));
        return;
      }
      setStoryStatuses((m) => ({ ...m, [id]: 'saving' }));
      try {
        const payload: {
          title: string;
          excerpt: string;
          featuredImage: string;
          isFeatured?: boolean;
        } = {
          title: row.title.trim(),
          excerpt: row.excerpt.trim().slice(0, 300),
          featuredImage: imageUrl,
        };
        if (showFeaturedCheckbox) {
          payload.isFeatured = !!row.isFeatured;
        }
        const updated = await adminApi.updateArticle(id, payload, token);
        setEditedStories((prev) => prev.map((x) => (x._id === updated._id ? { ...x, ...updated } : x)));
        onSavedRef.current?.(updated);
        setStoryStatuses((m) => ({ ...m, [id]: 'saved' }));
        window.setTimeout(() => {
          setStoryStatuses((m) => ({ ...m, [id]: 'idle' }));
        }, 2200);
      } catch {
        setStoryStatuses((m) => ({ ...m, [id]: 'error' }));
      }
    },
    [token, editedStories, baselineArticles, showFeaturedCheckbox]
  );

  return { editedStories, updateStoryField, saveStory, storyStatuses };
}
