import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentApi } from '@/lib/api';
import { AdminStoryEditorsList } from '@/components/admin/AdminStoryEditorsList';
import { categoryAdminBase } from '@/lib/adminCategoryNav';
import { useStoryEditors } from '@/hooks/useStoryEditors';
import { useAdminCategoryOutlet } from '@/pages/AdminCategoryLayout';
import type { Article } from '@/types/api';

const STORIES_PAGE_SIZE = 48;

export function AdminCategoryStoriesPage() {
  const { category, token } = useAdminCategoryOutlet();
  const base = categoryAdminBase(category.slug);
  const [stories, setStories] = useState<Article[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storiesError, setStoriesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setStoriesLoading(true);
      setStoriesError(null);
      try {
        const { articles } = await contentApi.articlesByCategory(category.slug, 1, STORIES_PAGE_SIZE);
        if (!cancelled) {
          setStories(articles);
        }
      } catch {
        if (!cancelled) {
          setStoriesError('Could not load stories.');
          setStories([]);
        }
      } finally {
        if (!cancelled) {
          setStoriesLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [category.slug]);

  const { editedStories, updateStoryField, saveStory, storyStatuses } = useStoryEditors(
    token,
    stories,
    false,
    (updated) => {
      setStories((prev) => prev.map((x) => (x._id === updated._id ? { ...x, ...updated } : x)));
    }
  );

  return (
    <AdminStoryEditorsList
      crumb={
        <nav className="admin-home-crumb">
          <Link to={base}>← {category.name} overview</Link>
        </nav>
      }
      editedStories={editedStories}
      updateStoryField={updateStoryField}
      saveStory={saveStory}
      storyStatuses={storyStatuses}
      showFeaturedCheckbox={false}
      storiesLoading={storiesLoading}
      storiesError={storiesError}
    />
  );
}
