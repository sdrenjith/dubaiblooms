import { useId } from 'react';
import { resolveMediaSrc } from '@/lib/mediaUrl';
import {
  emptySeoFields,
  formatKeywordsInput,
  normalizeSeoFields,
  parseKeywordsInput,
  type SeoFields,
} from '@/types/seo';

type Props = {
  value: SeoFields;
  onChange: (next: SeoFields) => void;
  placeholders?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    canonicalPath?: string;
  };
  showAdvanced?: boolean;
};

export function AdminSeoFieldsEditor({ value, onChange, placeholders, showAdvanced = true }: Props) {
  const idPrefix = useId().replace(/:/g, '');
  const seo = normalizeSeoFields(value ?? emptySeoFields);

  const patch = (partial: Partial<SeoFields>) => {
    onChange(normalizeSeoFields({ ...seo, ...partial }));
  };

  const previewImage = resolveMediaSrc(seo.ogImage || '');

  return (
    <div className="admin-seo-fields">
      <label className="admin-story-field">
        SEO title ({(seo.metaTitle || '').length}/90)
        <input
          type="text"
          maxLength={90}
          value={seo.metaTitle || ''}
          onChange={(e) => patch({ metaTitle: e.target.value })}
          placeholder={placeholders?.metaTitle || 'Page title for search results'}
        />
      </label>

      <label className="admin-story-field">
        SEO description ({(seo.metaDescription || '').length}/180)
        <textarea
          rows={3}
          maxLength={180}
          value={seo.metaDescription || ''}
          onChange={(e) => patch({ metaDescription: e.target.value })}
          placeholder={placeholders?.metaDescription || 'Short summary for search and social previews'}
        />
      </label>

      <label className="admin-story-field">
        Share image URL (Open Graph)
        <input
          type="text"
          spellCheck={false}
          value={seo.ogImage || ''}
          onChange={(e) => patch({ ogImage: e.target.value })}
          placeholder={placeholders?.ogImage || 'https://… or /uploads/…'}
        />
      </label>

      {previewImage ? (
        <div className="admin-seo-preview-image">
          <img src={previewImage} alt="" />
        </div>
      ) : null}

      {showAdvanced ? (
        <div className="admin-seo-advanced">
          <p className="admin-seo-advanced-label">Advanced</p>
          <label className="admin-story-field">
            Focus keywords (comma-separated, max 20)
            <input
              type="text"
              value={formatKeywordsInput(seo.keywords)}
              onChange={(e) => patch({ keywords: parseKeywordsInput(e.target.value) })}
              placeholder="dubai news, lifestyle, travel"
            />
          </label>
          <label className="admin-story-field">
            Canonical path override
            <input
              type="text"
              spellCheck={false}
              value={seo.canonicalPath || ''}
              onChange={(e) => patch({ canonicalPath: e.target.value })}
              placeholder={placeholders?.canonicalPath || '/category/news or /news/story-slug'}
            />
          </label>
          <label className="admin-story-seo-checkbox">
            <input
              id={`${idPrefix}-noindex`}
              type="checkbox"
              checked={!!seo.noIndex}
              onChange={(e) => patch({ noIndex: e.target.checked })}
            />
            Hide from search engines (noindex)
          </label>
        </div>
      ) : null}
    </div>
  );
}
