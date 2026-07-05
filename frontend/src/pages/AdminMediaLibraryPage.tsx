import { useCallback, useEffect, useId, useState } from 'react';
import {
  deleteMediaFromLibrary,
  listMediaLibrary,
  updateMediaLibraryAlt,
  uploadAdminMedia,
  type MediaLibraryEntry,
} from '@/lib/api';
import { readAdminToken } from '@/lib/adminAuth';
import { resolveMediaSrc } from '@/lib/mediaUrl';
import { useAdminConfirm } from '@/context/AdminConfirmContext';
import { useAdminToast } from '@/context/AdminToastContext';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminMediaLibraryPage() {
  const token = readAdminToken();
  const toast = useAdminToast();
  const askConfirm = useAdminConfirm();
  const uploadInputId = useId();
  const [entries, setEntries] = useState<MediaLibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingFilename, setDeletingFilename] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});
  const [savingAltFilename, setSavingAltFilename] = useState<string | null>(null);

  const loadLibrary = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const data = await listMediaLibrary(token);
      setEntries(data);
      setAltDrafts(Object.fromEntries(data.map((entry) => [entry.filename, entry.alt || ''])));
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Could not load media library.');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  if (!token) {
    return null;
  }

  const filtered = entries.filter((entry) => filter === 'all' || entry.type === filter);

  const copyUrl = async (url: string) => {
    const absolute = resolveMediaSrc(url) || url;
    try {
      await navigator.clipboard.writeText(absolute.startsWith('http') ? absolute : `${window.location.origin}${url}`);
      setCopiedUrl(url);
      toast('success', 'URL copied to clipboard.');
      window.setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      toast('error', 'Could not copy URL.');
    }
  };

  const saveAlt = async (entry: MediaLibraryEntry) => {
    const alt = (altDrafts[entry.filename] ?? entry.alt ?? '').trim().slice(0, 200);
    setSavingAltFilename(entry.filename);
    try {
      const saved = await updateMediaLibraryAlt(entry.filename, alt, token);
      setEntries((prev) =>
        prev.map((x) => (x.filename === entry.filename ? { ...x, alt: saved.alt } : x))
      );
      setAltDrafts((prev) => ({ ...prev, [entry.filename]: saved.alt }));
      toast('success', 'Alt text saved.');
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Could not save alt text.');
    } finally {
      setSavingAltFilename(null);
    }
  };

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      await uploadAdminMedia(file, token);
      toast('success', 'File uploaded to the library.');
      await loadLibrary();
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const onRemove = async (entry: MediaLibraryEntry) => {
    const confirmed = await askConfirm({
      title: 'Remove from library',
      message: `“${entry.filename}” will be deleted from the server. Stories or settings that still use this URL may show broken media until you update them.`,
      confirmLabel: 'Remove file',
      variant: 'danger',
    });
    if (!confirmed) {
      return;
    }
    setDeletingFilename(entry.filename);
    try {
      await deleteMediaFromLibrary(entry.filename, token);
      setEntries((prev) => prev.filter((x) => x.filename !== entry.filename));
      toast('success', 'File removed from the library.');
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Could not remove file.');
    } finally {
      setDeletingFilename(null);
    }
  };

  return (
    <div className="admin-app-panel">
      <div className="admin-screen-intro">
        <h1 className="admin-screen-title">Media library</h1>
        <p className="lede admin-screen-lede">
          Upload and browse images and videos used across the site — story sidebars, logos, and cover images. When
          editing a story, use <strong>From library</strong> to attach files from here.
        </p>
      </div>

      <section className="admin-card admin-card-wide">
        <div className="admin-media-library-toolbar">
          <div className="admin-media-picker-filters">
            {(['all', 'image', 'video'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`admin-media-picker-filter${filter === value ? ' is-active' : ''}`}
                onClick={() => setFilter(value)}
              >
                {value === 'all' ? 'All' : value === 'image' ? 'Images' : 'Videos'}
              </button>
            ))}
          </div>
          <div className="admin-media-library-actions">
            <button type="button" className="admin-story-media-btn" onClick={() => void loadLibrary()} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <input
              id={uploadInputId}
              className="admin-file-input-hidden"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,video/ogg"
              disabled={uploading}
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
              className={`admin-story-media-btn${uploading ? ' is-disabled' : ''}`}
            >
              {uploading ? 'Uploading…' : 'Upload file'}
            </label>
          </div>
        </div>

        {loading && entries.length === 0 ? <div className="status-banner">Loading library…</div> : null}
        {!loading && filtered.length === 0 ? (
          <div className="status-banner">
            {entries.length === 0
              ? 'No files yet. Upload an image or video to get started.'
              : 'No files match this filter.'}
          </div>
        ) : null}

        {!loading && filtered.length > 0 ? (
          <p className="admin-media-library-count">
            Showing {filtered.length} of {entries.length} file{entries.length === 1 ? '' : 's'}
          </p>
        ) : null}

        <div className="admin-media-library-grid">
          {filtered.map((entry) => {
            const src = resolveMediaSrc(entry.url);
            const isDeleting = deletingFilename === entry.filename;
            const altDraft = altDrafts[entry.filename] ?? entry.alt ?? '';
            const altSaved = altDraft.trim() === (entry.alt || '').trim();
            const isSavingAlt = savingAltFilename === entry.filename;
            return (
              <article key={entry.url} className="admin-media-library-card">
                <div className="admin-media-picker-thumb">
                  {entry.type === 'video' ? (
                    src ? (
                      <video src={src} muted playsInline preload="metadata" title={altDraft || entry.filename} />
                    ) : (
                      <span className="admin-media-picker-fallback">Video</span>
                    )
                  ) : src ? (
                    <img src={src} alt={altDraft || entry.filename} loading="lazy" />
                  ) : (
                    <span className="admin-media-picker-fallback">Image</span>
                  )}
                  <span className="admin-media-picker-type">{entry.type}</span>
                </div>
                <p className="admin-media-library-name" title={entry.filename}>
                  {entry.filename}
                </p>
                <p className="admin-media-library-meta">
                  {formatFileSize(entry.size)} · {new Date(entry.createdAt).toLocaleDateString()}
                </p>
                <p className="admin-media-library-url" title={entry.url}>
                  {entry.url}
                </p>
                <label className="admin-media-library-alt">
                  Alt text
                  <input
                    type="text"
                    maxLength={200}
                    value={altDraft}
                    disabled={isDeleting || isSavingAlt}
                    placeholder="Describe this image for accessibility"
                    onChange={(e) =>
                      setAltDrafts((prev) => ({ ...prev, [entry.filename]: e.target.value }))
                    }
                  />
                </label>
                <div className="admin-media-library-card-actions">
                  <button
                    type="button"
                    className="admin-story-media-btn admin-media-library-copy"
                    disabled={isDeleting}
                    onClick={() => void copyUrl(entry.url)}
                  >
                    {copiedUrl === entry.url ? 'Copied' : 'Copy URL'}
                  </button>
                  <button
                    type="button"
                    className="admin-story-media-btn admin-media-library-save-alt"
                    disabled={isDeleting || isSavingAlt || altSaved}
                    onClick={() => void saveAlt(entry)}
                  >
                    {isSavingAlt ? 'Saving…' : 'Save alt'}
                  </button>
                  <button
                    type="button"
                    className="admin-story-media-btn admin-media-library-remove"
                    disabled={isDeleting || isSavingAlt}
                    onClick={() => void onRemove(entry)}
                  >
                    {isDeleting ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
