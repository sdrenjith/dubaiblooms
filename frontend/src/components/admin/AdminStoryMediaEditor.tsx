import { useId, useState } from 'react';
import { uploadAdminMedia, type MediaLibraryEntry } from '@/lib/api';
import { inferMediaType, normalizeStoryMedia } from '@/lib/storyMedia';
import { resolveMediaSrc } from '@/lib/mediaUrl';
import { useAdminToast } from '@/context/AdminToastContext';
import { AdminMediaLibraryPicker } from '@/components/admin/AdminMediaLibraryPicker';
import type { StoryMediaItem } from '@/types/api';

type Props = {
  token: string | null;
  media: StoryMediaItem[];
  onChange: (media: StoryMediaItem[]) => void;
};

export function AdminStoryMediaEditor({ token, media, onChange }: Props) {
  const toast = useAdminToast();
  const uploadInputId = useId();
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const items = normalizeStoryMedia(media);

  const setItems = (next: StoryMediaItem[]) => {
    onChange(normalizeStoryMedia(next));
  };

  const addItem = (item: StoryMediaItem) => {
    if (items.some((x) => x.url === item.url)) {
      toast('error', 'This media is already attached to the story.');
      return;
    }
    if (items.length >= 30) {
      toast('error', 'Maximum 30 media items per story.');
      return;
    }
    setItems([...items, { ...item, order: items.length }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) {
      return;
    }
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };

  const updateAlt = (index: number, alt: string) => {
    setItems(items.map((item, i) => (i === index ? { ...item, alt } : item)));
  };

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const uploaded = await uploadAdminMedia(file, token || undefined);
      addItem({ url: uploaded.url, type: uploaded.type, alt: '', order: items.length });
      toast('success', 'Media uploaded. Save the story to publish changes.');
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const onAddUrl = () => {
    const url = urlDraft.trim();
    if (!url) {
      return;
    }
    addItem({ url, type: inferMediaType(url), alt: '', order: items.length });
    setUrlDraft('');
  };

  const onLibrarySelect = (entry: MediaLibraryEntry) => {
    addItem({ url: entry.url, type: entry.type, alt: entry.alt || '', order: items.length });
  };

  return (
    <div className="admin-story-media-editor">
      <div className="admin-story-media-head">
        <span className="admin-story-media-label">Story media ({items.length}/30)</span>
        <span className="admin-story-media-sub">Images or videos shown in the sidebar on the public story page.</span>
      </div>

      {items.length > 0 ? (
        <ul className="admin-story-media-list">
          {items.map((item, index) => {
            const src = resolveMediaSrc(item.url);
            return (
              <li key={`${item.url}-${index}`} className="admin-story-media-row">
                <div className="admin-story-media-preview">
                  {item.type === 'video' ? (
                    src ? (
                      <video src={src} muted playsInline preload="metadata" />
                    ) : (
                      <span>Video</span>
                    )
                  ) : src ? (
                    <img src={src} alt={item.alt || ''} />
                  ) : (
                    <span>Image</span>
                  )}
                </div>
                <div className="admin-story-media-fields">
                  <p className="admin-story-media-url" title={item.url}>
                    {item.url}
                  </p>
                  <label className="admin-story-media-alt">
                    Alt text (optional)
                    <input
                      type="text"
                      maxLength={200}
                      value={item.alt || ''}
                      onChange={(e) => updateAlt(index, e.target.value)}
                    />
                  </label>
                  <div className="admin-story-media-row-actions">
                    <button type="button" disabled={index === 0} onClick={() => moveItem(index, -1)}>
                      ↑
                    </button>
                    <button type="button" disabled={index === items.length - 1} onClick={() => moveItem(index, 1)}>
                      ↓
                    </button>
                    <button type="button" className="admin-story-media-remove" onClick={() => removeItem(index)}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="admin-story-media-empty">No media yet. Upload, paste a URL, or pick from the library.</p>
      )}

      <div className="admin-story-media-actions">
        <input
          id={uploadInputId}
          className="admin-file-input-hidden"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,video/ogg"
          disabled={uploading || !token}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) {
              void onUpload(file);
            }
          }}
        />
        <label
          htmlFor={uploadInputId}
          className={`admin-story-media-btn${uploading || !token ? ' is-disabled' : ''}`}
        >
          {uploading ? 'Uploading…' : 'Upload file'}
        </label>
        <button type="button" className="admin-story-media-btn" disabled={!token} onClick={() => setLibraryOpen(true)}>
          From library
        </button>
        <div className="admin-story-media-url-add">
          <input
            type="url"
            placeholder="Or paste image/video URL"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddUrl();
              }
            }}
          />
          <button type="button" onClick={onAddUrl} disabled={!urlDraft.trim()}>
            Add URL
          </button>
        </div>
      </div>

      {token ? (
        <AdminMediaLibraryPicker
          token={token}
          open={libraryOpen}
          onClose={() => setLibraryOpen(false)}
          onSelect={onLibrarySelect}
          existingUrls={items.map((x) => x.url)}
        />
      ) : null}
    </div>
  );
}
