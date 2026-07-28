import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi } from '@/lib/api';
import { normalizeStoryMedia } from '@/lib/storyMedia';
import { normalizeArticleSeoForSave } from '@/lib/seoMeta';
import { isValidSlugInput, normalizeSlugInput } from '@/lib/slug';
import { useAdminConfirm } from '@/context/AdminConfirmContext';
import { useAdminToast } from '@/context/AdminToastContext';
import type { Article, StoryMediaItem } from '@/types/api';

type StoryStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useStoryEditors(
  token: string | null,
  baselineArticles: Article[],
  showFeaturedCheckbox: boolean,
  onSaved?: (updated: Article) => void,
  onDeleted?: (id: string) => void
) {
  const toast = useAdminToast();
  const askConfirm = useAdminConfirm();
  const [editedStories, setEditedStories] = useState<Article[]>([]);
  const [storyStatuses, setStoryStatuses] = useState<Record<string, StoryStatus>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const onSavedRef = useRef(onSaved);
  const onDeletedRef = useRef(onDeleted);
  onSavedRef.current = onSaved;
  onDeletedRef.current = onDeleted;

  useEffect(() => {
    setEditedStories(
      baselineArticles.map((a) => ({
        ...a,
        media: normalizeStoryMedia(a.media),
      }))
    );
    setStoryStatuses({});
  }, [baselineArticles]);

  const updateStoryField = useCallback((id: string, patch: Partial<Article>) => {
    setEditedStories((prev) =>
      prev.map((x) => {
        if (x._id !== id) {
          return x;
        }
        const next = { ...x, ...patch };
        if (patch.media !== undefined) {
          next.media = normalizeStoryMedia(patch.media);
        }
        return next;
      })
    );
  }, []);

  const updateStoryMedia = useCallback((id: string, media: StoryMediaItem[]) => {
    updateStoryField(id, { media: normalizeStoryMedia(media) });
  }, [updateStoryField]);

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
        toast('error', 'Featured image URL is required before saving.');
        return;
      }
      const slug = normalizeSlugInput(row.slug || '');
      if (!isValidSlugInput(slug)) {
        setStoryStatuses((m) => ({ ...m, [id]: 'error' }));
        toast('error', 'URL slug is required. Use lowercase letters, numbers, and hyphens.');
        return;
      }
      setStoryStatuses((m) => ({ ...m, [id]: 'saving' }));
      try {
        const bodyHtml = (row.content ?? '').trim() || '<p></p>';
        const instagramPostUrl = (row.instagramPostUrl || '').trim();
        if (instagramPostUrl && !/^https?:\/\//i.test(instagramPostUrl)) {
          setStoryStatuses((m) => ({ ...m, [id]: 'error' }));
          toast('error', 'Instagram post URL must start with http:// or https://.');
          return;
        }
        const payload: {
          title: string;
          slug: string;
          excerpt: string;
          featuredImage: string;
          content: string;
          media: StoryMediaItem[];
          seo: NonNullable<Article['seo']>;
          instagramPostUrl: string;
          isFeatured?: boolean;
        } = {
          title: row.title.trim(),
          slug,
          excerpt: row.excerpt.trim().slice(0, 600),
          featuredImage: imageUrl,
          content: bodyHtml,
          media: normalizeStoryMedia(row.media),
          seo: normalizeArticleSeoForSave(row.seo),
          instagramPostUrl,
        };
        if (showFeaturedCheckbox) {
          payload.isFeatured = !!row.isFeatured;
        }
        const updated = await adminApi.updateArticle(id, payload, token);
        setEditedStories((prev) => prev.map((x) => (x._id === updated._id ? { ...x, ...updated } : x)));
        onSavedRef.current?.(updated);
        toast('success', 'Story saved.');
        setStoryStatuses((m) => ({ ...m, [id]: 'saved' }));
        window.setTimeout(() => {
          setStoryStatuses((m) => ({ ...m, [id]: 'idle' }));
        }, 2200);
      } catch (err) {
        const msg =
          axios.isAxiosError(err) && err.response?.data && typeof err.response.data.message === 'string'
            ? err.response.data.message
            : 'Save failed. Check your connection and try again.';
        toast('error', msg);
        setStoryStatuses((m) => ({ ...m, [id]: 'error' }));
      }
    },
    [token, editedStories, baselineArticles, showFeaturedCheckbox, toast]
  );

  const deleteStory = useCallback(
    async (id: string) => {
      if (!token) {
        return;
      }
      const row = editedStories.find((x) => x._id === id);
      if (!row) {
        return;
      }
      const label = row.title.trim() || 'this story';
      const confirmed = await askConfirm({
        title: 'Delete story',
        message: `“${label}” will be removed permanently. This cannot be undone.`,
        confirmLabel: 'Delete story',
        variant: 'danger',
      });
      if (!confirmed) {
        return;
      }
      setDeletingId(id);
      try {
        await adminApi.deleteArticle(id, token);
        setEditedStories((prev) => prev.filter((x) => x._id !== id));
        setStoryStatuses((m) => {
          const next = { ...m };
          delete next[id];
          return next;
        });
        onDeletedRef.current?.(id);
        toast('success', 'Story deleted.');
      } catch (err) {
        const msg =
          axios.isAxiosError(err) && err.response?.data && typeof err.response.data.message === 'string'
            ? err.response.data.message
            : 'Could not delete story.';
        toast('error', msg);
      } finally {
        setDeletingId(null);
      }
    },
    [token, editedStories, toast, askConfirm]
  );

  return { editedStories, updateStoryField, updateStoryMedia, saveStory, deleteStory, storyStatuses, deletingId };
}
