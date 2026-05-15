import axios from 'axios';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, contentApi } from '@/lib/api';
import { AdminStoryEditorsList } from '@/components/admin/AdminStoryEditorsList';
import { categoryAdminBase } from '@/lib/adminCategoryNav';
import { useStoryEditors } from '@/hooks/useStoryEditors';
import { useAdminToast } from '@/context/AdminToastContext';
import { useAdminCategoryOutlet } from '@/pages/AdminCategoryLayout';
import type { Article } from '@/types/api';

const STORIES_PAGE_SIZE = 48;

const PLACEHOLDER_COVER_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=800&q=80&ixlib=rb-4.0.3';

export function AdminCategoryStoriesPage() {
  const { category, token } = useAdminCategoryOutlet();
  const toast = useAdminToast();
  const base = categoryAdminBase(category.slug);
  const [stories, setStories] = useState<Article[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);

  const [addTitle, setAddTitle] = useState('');
  const [addExcerpt, setAddExcerpt] = useState('');
  const [addBody, setAddBody] = useState('');
  const [addImage, setAddImage] = useState(PLACEHOLDER_COVER_IMAGE);
  const [addFeatured, setAddFeatured] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadStories = useCallback(async () => {
    setStoriesLoading(true);
    try {
      const { articles } = await contentApi.articlesByCategory(category.slug, 1, STORIES_PAGE_SIZE);
      setStories(articles);
    } catch {
      toast('error', 'Could not load stories.');
      setStories([]);
    } finally {
      setStoriesLoading(false);
    }
  }, [category.slug, toast]);

  useEffect(() => {
    void loadStories();
  }, [loadStories]);

  const { editedStories, updateStoryField, saveStory, deleteStory, storyStatuses, deletingId } = useStoryEditors(
    token,
    stories,
    false,
    (updated) => {
      setStories((prev) => prev.map((x) => (x._id === updated._id ? { ...x, ...updated } : x)));
    },
    (id) => {
      setStories((prev) => prev.filter((x) => x._id !== id));
    }
  );

  const onCreateStory = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      return;
    }
    const title = addTitle.trim();
    if (!title) {
      toast('error', 'Title is required.');
      return;
    }
    const featuredImage = addImage.trim() || PLACEHOLDER_COVER_IMAGE;
    const excerpt = (addExcerpt.trim() || 'Draft excerpt — edit after publish.').slice(0, 600);
    setCreating(true);
    try {
      await adminApi.createArticle(
        {
          title,
          excerpt,
          featuredImage,
          category: category._id,
          content: addBody.trim() || '<p>Draft story. Edit body from the API or future editor.</p>',
          isFeatured: addFeatured,
        },
        token
      );
      setAddTitle('');
      setAddExcerpt('');
      setAddBody('');
      setAddImage(PLACEHOLDER_COVER_IMAGE);
      setAddFeatured(false);
      toast('success', 'Story created. It appears below — adjust fields and use Save story on each card.');
      await loadStories();
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data.message === 'string'
          ? err.response.data.message
          : 'Could not create story.';
      toast('error', msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <nav className="admin-home-crumb">
        <Link to={base}>← {category.name} overview</Link>
      </nav>
      <div className="admin-screen-intro" style={{ marginBottom: '1rem' }}>
        <h1 className="admin-screen-title" style={{ marginBottom: '0.25rem' }}>
          Stories in {category.name}
        </h1>
        <p className="lede admin-screen-lede">
          Add new cards for <code>/category/{category.slug}/…</code> and for homepage blocks that use this category.{' '}
          <Link className="button-link" to={`/category/${category.slug}`} target="_blank" rel="noreferrer">
            View public category →
          </Link>
        </p>
      </div>

      <section className="admin-card admin-card-wide" style={{ marginBottom: '1.25rem' }}>
        <h2 className="admin-home-block-title" style={{ marginTop: 0 }}>
          Add story card
        </h2>
        <p className="lede admin-hint">
          Creates a published article in this category. Replace the placeholder cover URL when ready.
        </p>
        <form className="admin-home-section-fields" onSubmit={(e) => void onCreateStory(e)}>
          <label>
            Title
            <input value={addTitle} onChange={(e) => setAddTitle(e.target.value)} required />
          </label>
          <label>
            Featured image URL
            <input
              type="url"
              value={addImage}
              onChange={(e) => setAddImage(e.target.value)}
              placeholder={PLACEHOLDER_COVER_IMAGE}
            />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Excerpt (optional, max 600)
            <textarea
              rows={3}
              maxLength={600}
              value={addExcerpt}
              onChange={(e) => setAddExcerpt(e.target.value)}
            />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Body (optional HTML — short draft is fine)
            <textarea rows={4} value={addBody} onChange={(e) => setAddBody(e.target.value)} />
          </label>
          <label style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="checkbox" checked={addFeatured} onChange={(e) => setAddFeatured(e.target.checked)} /> Also flag
            as featured (homepage hero / featured grids)
          </label>
          <button className="admin-save" type="submit" disabled={creating} style={{ gridColumn: '1 / -1' }}>
            {creating ? 'Creating…' : 'Add story'}
          </button>
        </form>
      </section>

      <AdminStoryEditorsList
        editedStories={editedStories}
        updateStoryField={updateStoryField}
        saveStory={saveStory}
        deleteStory={deleteStory}
        deletingId={deletingId}
        storyStatuses={storyStatuses}
        showFeaturedCheckbox={false}
        storiesLoading={storiesLoading}
        storiesError={null}
      />
    </>
  );
}
