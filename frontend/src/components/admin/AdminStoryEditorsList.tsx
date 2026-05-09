import type { ReactNode } from 'react';
import { articleHref, thumb } from '@/lib/adminStoryUtils';
import type { Article } from '@/types/api';

type StoryStatus = 'idle' | 'saving' | 'saved' | 'error';

type Props = {
  editedStories: Article[];
  updateStoryField: (id: string, patch: Partial<Article>) => void;
  saveStory: (id: string) => void | Promise<void>;
  storyStatuses: Record<string, StoryStatus>;
  showFeaturedCheckbox: boolean;
  storiesLoading: boolean;
  storiesError: string | null;
  crumb?: ReactNode;
  title?: string;
  hint?: ReactNode;
};

export function AdminStoryEditorsList({
  editedStories,
  updateStoryField,
  saveStory,
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
            Edit each card below, then use <strong>Save story</strong>. Excerpt is limited to 300 characters on the server.
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
                Excerpt ({a.excerpt.length}/300)
                <textarea
                  rows={4}
                  maxLength={300}
                  value={a.excerpt}
                  onChange={(e) => updateStoryField(a._id, { excerpt: e.target.value })}
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
                <a className="button-link" href={articleHref(a)} target="_blank" rel="noreferrer">
                  Open on site →
                </a>
                <button
                  type="button"
                  className="admin-tiles-btn-primary"
                  disabled={status === 'saving'}
                  onClick={() => void saveStory(a._id)}
                >
                  {status === 'saving' ? 'Saving…' : 'Save story'}
                </button>
                {status === 'saved' ? (
                  <span className="admin-story-save-status ok" aria-live="polite">
                    Saved
                  </span>
                ) : null}
                {status === 'error' ? (
                  <span className="admin-story-save-status err" role="alert">
                    Save failed
                  </span>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
