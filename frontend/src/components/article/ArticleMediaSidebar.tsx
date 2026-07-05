import { embedVideoUrl, isEmbeddableVideoUrl } from '@/lib/storyMedia';
import { resolveMediaSrc } from '@/lib/mediaUrl';
import type { StoryMediaItem } from '@/types/api';

type Props = {
  media: StoryMediaItem[];
  storyTitle: string;
};

export function ArticleMediaSidebar({ media, storyTitle }: Props) {
  if (!media.length) {
    return null;
  }

  return (
    <aside className="article-media-sidebar" aria-label="Story media">
      <ul className="article-media-list">
        {media.map((item, index) => {
          const src = resolveMediaSrc(item.url);
          const alt = item.alt?.trim() || `${storyTitle} media ${index + 1}`;
          const key = `${item.url}-${index}`;

          if (item.type === 'video' && isEmbeddableVideoUrl(item.url)) {
            return (
              <li key={key} className="article-media-item">
                <div className="article-media-frame article-media-frame-video">
                  <iframe
                    src={embedVideoUrl(item.url)}
                    title={alt}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </li>
            );
          }

          if (item.type === 'video') {
            return (
              <li key={key} className="article-media-item">
                <div className="article-media-frame article-media-frame-video">
                  {src ? (
                    <video src={src} controls playsInline preload="metadata" title={alt} />
                  ) : (
                    <p className="article-media-unavailable">Video unavailable</p>
                  )}
                </div>
              </li>
            );
          }

          return (
            <li key={key} className="article-media-item">
              <div className="article-media-frame">
                {src ? (
                  <img src={src} alt={alt} loading="lazy" decoding="async" />
                ) : (
                  <p className="article-media-unavailable">Image unavailable</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
