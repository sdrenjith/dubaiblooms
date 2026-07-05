import { useCallback, useEffect, useState } from 'react';
import { listMediaLibrary, type MediaLibraryEntry } from '@/lib/api';
import { resolveMediaSrc } from '@/lib/mediaUrl';
import { useAdminToast } from '@/context/AdminToastContext';

type Props = {
  token: string;
  open: boolean;
  onClose: () => void;
  onSelect: (entry: MediaLibraryEntry) => void;
  existingUrls?: string[];
};

export function AdminMediaLibraryPicker({ token, open, onClose, onSelect, existingUrls = [] }: Props) {
  const toast = useAdminToast();
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<MediaLibraryEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

  const loadLibrary = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const data = await listMediaLibrary(token);
      setEntries(data);
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Could not load media library.');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (open) {
      void loadLibrary();
    }
  }, [open, loadLibrary]);

  if (!open) {
    return null;
  }

  const existing = new Set(existingUrls);
  const filtered = entries.filter((entry) => filter === 'all' || entry.type === filter);

  return (
    <div className="admin-media-picker-overlay" role="presentation" onClick={onClose}>
      <div
        className="admin-media-picker-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-media-picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-media-picker-head">
          <h3 id="admin-media-picker-title">Media library</h3>
          <button type="button" className="admin-media-picker-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <p className="admin-media-picker-hint">Select an uploaded image or video to attach to this story.</p>
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
          <button type="button" className="admin-media-picker-refresh" onClick={() => void loadLibrary()} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        {loading && entries.length === 0 ? <div className="status-banner">Loading library…</div> : null}
        {!loading && filtered.length === 0 ? (
          <div className="status-banner">No media in the library yet. Upload files using the upload button.</div>
        ) : null}
        <div className="admin-media-picker-grid">
          {filtered.map((entry) => {
            const src = resolveMediaSrc(entry.url);
            const isUsed = existing.has(entry.url);
            return (
              <button
                key={entry.url}
                type="button"
                className={`admin-media-picker-item${isUsed ? ' is-used' : ''}`}
                disabled={isUsed}
                onClick={() => {
                  onSelect(entry);
                  onClose();
                }}
              >
                <div className="admin-media-picker-thumb">
                  {entry.type === 'video' ? (
                    src ? (
                      <video src={src} muted playsInline preload="metadata" />
                    ) : (
                      <span className="admin-media-picker-fallback">Video</span>
                    )
                  ) : src ? (
                    <img src={src} alt={entry.alt || entry.filename} loading="lazy" />
                  ) : (
                    <span className="admin-media-picker-fallback">Image</span>
                  )}
                  <span className="admin-media-picker-type">{entry.type}</span>
                </div>
                <span className="admin-media-picker-name">{entry.filename}</span>
                {isUsed ? <span className="admin-media-picker-used">Already added</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
