import type { ReactNode } from 'react';
import { AdminSeoFieldsEditor } from '@/components/admin/AdminSeoFieldsEditor';
import { AdminStoryMediaEditor } from '@/components/admin/AdminStoryMediaEditor';
import { articleHref, thumb } from '@/lib/adminStoryUtils';
import { normalizeSlugInput } from '@/lib/slug';
import type { Article, StoryMediaItem } from '@/types/api';

type StoryStatus = 'idle' | 'saving' | 'saved' | 'error';

type Props = {
  token: string | null;
  editedStories: Article[];
  updateStoryField: (id: string, patch: Partial<Article>) => void;
  updateStoryMedia: (id: string, media: StoryMediaItem[]) => void;
  saveStory: (id: string) => void | Promise<void>;
  deleteStory: (id: string) => void | Promise<void>;
  deletingId: string | null;
  storyStatuses: Record<string, StoryStatus>;
  showFeaturedCheckbox: boolean;
  storiesLoading: boolean;
  storiesError: string | null;
  crumb?: ReactNode;
  title?: string;
  hint?: ReactNode;
};

export function AdminStoryEditorsList({
  token,
  editedStories,
  updateStoryField,
  updateStoryMedia,
  saveStory,
  deleteStory,
  deletingId,
  storyStatuses,
  showFeaturedCheckbox,
  storiesLoading,
  storiesError,
  crumb,
  title = 'Stories on the site',
  hint,
}: Props) {
  return (
    <>
      {crumb}
      <h2 className="admin-home-block-title">{title}</h2>
      <p className="lede admin-hint admin-story-grid-hint">
        {hint ?? (
          <>
            Edit each card below, then use <strong>Save story</strong>. Excerpt is limited to 600 characters. Body is HTML
            for the main story text on the public page. Use <strong>Story media</strong> for extra images or videos shown
            in a sidebar beside the article.
            {showFeaturedCheckbox ? ' “Featured story” controls inclusion in featured feeds.' : ''}
          </>
        )}
      </p>
      {storiesLoading ? <div className="status-banner">Loading stories…</div> : null}
      {storiesError ? <div className="status-banner">{storiesError}</div> : null}
      {!storiesLoading && editedStories.length === 0 ? (
        <div className="status-banner">
          No articles for this source yet. Run <code>npm run seed</code> in the server or publish posts.
        </div>
      ) : null}
      <div className="admin-home-card-grid">
        {editedStories.map((a) => {
          const status = storyStatuses[a._id] || 'idle';
          const isDeleting = deletingId === a._id;
          const imgSrc = thumb(a.featuredImage);
          return (
            <article key={a._id} className="admin-item-card admin-story-editor-card">
              <p className="admin-item-card-kicker">{a.category?.name || 'Story'}</p>
              {imgSrc ? (
                <div className="admin-story-thumb admin-story-thumb-editor">
                  <img src={imgSrc} alt="" />
                </div>
              ) : (
                <div className="admin-story-thumb admin-story-thumb-editor admin-story-thumb-empty">No image URL</div>
              )}
              <label className="admin-story-field">
                Title
                <input
                  type="text"
                  value={a.title}
                  onChange={(e) => updateStoryField(a._id, { title: e.target.value })}
                />
              </label>
              <label className="admin-story-field">
                URL slug
                <input
                  type="text"
                  spellCheck={false}
                  value={a.slug || ''}
                  onChange={(e) => updateStoryField(a._id, { slug: normalizeSlugInput(e.target.value) })}
                  placeholder="story-url-slug"
                />
                <span className="admin-hint">
                  Public path: <code>/{a.category?.slug || 'story'}/{a.slug || '…'}</code>
                </span>
              </label>
              <label className="admin-story-field">
                Excerpt ({a.excerpt.length}/600)
                <textarea
                  rows={4}
                  maxLength={600}
                  value={a.excerpt}
                  onChange={(e) => updateStoryField(a._id, { excerpt: e.target.value })}
                />
              </label>
              <label className="admin-story-field" style={{ gridColumn: '1 / -1' }}>
                Body (HTML — main article text)
                <textarea
                  className="admin-story-body-area"
                  rows={10}
                  spellCheck={false}
                  value={a.content ?? ''}
                  onChange={(e) => updateStoryField(a._id, { content: e.target.value })}
                />
              </label>
              <label className="admin-story-field">
                Featured image URL
                <input
                  type="text"
                  spellCheck={false}
                  value={a.featuredImage || ''}
                  onChange={(e) => updateStoryField(a._id, { featuredImage: e.target.value })}
                />
              </label>
              <div className="admin-story-field" style={{ gridColumn: '1 / -1' }}>
                <AdminStoryMediaEditor
                  token={token}
                  media={a.media || []}
                  onChange={(media) => updateStoryMedia(a._id, media)}
                />
              </div>
              <fieldset className="admin-story-seo-fieldset" style={{ gridColumn: '1 / -1' }}>
                <legend>SEO (optional)</legend>
                <p className="admin-story-seo-hint">
                  Overrides site defaults for this story in search and social previews. Leave blank to use the title and
                  excerpt.
                </p>
                <AdminSeoFieldsEditor
                  value={a.seo || {}}
                  onChange={(seo) => updateStoryField(a._id, { seo })}
                  placeholders={{
                    metaTitle: a.title,
                    metaDescription: a.excerpt,
                    ogImage: a.featuredImage || '',
                    canonicalPath: `/${a.category?.slug || 'story'}/${a.slug}`,
                  }}
                />
              </fieldset>
              {showFeaturedCheckbox ? (
                <label className="admin-story-featured-label">
                  <input
                    type="checkbox"
                    checked={!!a.isFeatured}
                    onChange={(e) => updateStoryField(a._id, { isFeatured: e.target.checked })}
                  />
                  Featured story
                </label>
              ) : null}
              <div className="admin-story-editor-actions">
                <a
                  className="admin-story-action-btn admin-story-action-secondary"
                  href={articleHref(a)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open on site
                </a>
                <button
                  type="button"
                  className="admin-story-action-btn admin-story-action-danger"
                  disabled={isDeleting || status === 'saving'}
                  onClick={() => void deleteStory(a._id)}
                >
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </button>
                <button
                  type="button"
                  className="admin-story-action-btn admin-story-action-primary"
                  disabled={status === 'saving' || isDeleting}
                  onClick={() => void saveStory(a._id)}
                >
                  {status === 'saving' ? 'Saving…' : 'Save'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
