import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentApi } from '@/lib/api';
import type { Article } from '@/types/api';

const fallbackTiles = ['Latest updates', 'Top experiences', 'Culinary delights', 'Live well', 'Art & heritage', 'Wander more'];

function getImageUrl(image?: string): string {
  if (!image) {
    return '';
  }
  if (image.startsWith('http')) {
    return image;
  }
  return image.startsWith('/') ? image : `/${image}`;
}

function formatDate(date?: string): string {
  if (!date) {
    return 'Fresh update';
  }
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function HomePage() {
  const [featured, setFeatured] = useState<Article[]>([]);
  const [latest, setLatest] = useState<Article[]>([]);
  const leadStory = featured[0] || latest[0];

  useEffect(() => {
    void Promise.all([contentApi.featured(), contentApi.latest(6)]).then(([featuredItems, latestItems]) => {
      setFeatured(featuredItems);
      setLatest(latestItems);
    });
  }, []);

  return (
    <div className="page-wrap">
      <section className="hero hero-story">
        <div className="hero-media">
          {leadStory?.featuredImage ? (
            <img src={getImageUrl(leadStory.featuredImage)} alt={leadStory.title} />
          ) : (
            <div className="hero-placeholder">Dubai Blooms</div>
          )}
        </div>

        <div className="hero-copy">
          <p className="eyebrow">{leadStory?.category?.name || 'Travel'}</p>
          <h1>{leadStory?.title || 'Weekend Escapes and Elevated City Discoveries'}</h1>
          <p className="lede">
            {leadStory?.excerpt ||
              'Curated premium experiences, culture highlights, and modern lifestyle stories from Dubai and beyond.'}
          </p>
          <Link className="button-link" to={leadStory ? `/${leadStory.category?.slug || 'story'}/${leadStory.slug}` : '/'}>
            Read More
          </Link>
        </div>
      </section>

      <section className="category-strip">
        {fallbackTiles.map((tile) => (
          <article key={tile} className="category-pill">
            <p className="card-meta">Dubai Blooms</p>
            <h3>{tile}</h3>
          </article>
        ))}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>On the Move</h2>
          <p>Daily city pulse, culture moments, and travel inspiration.</p>
        </div>
        <div className="feed-grid">
          {featured.slice(1, 5).map((item) => (
            <Link key={item._id} className="feed-card" to={`/${item.category?.slug || 'story'}/${item.slug}`}>
              <div className="feed-media">
                {item.featuredImage ? (
                  <img src={getImageUrl(item.featuredImage)} alt={item.title} />
                ) : (
                  <div className="feed-placeholder">{item.category?.name || 'Feature'}</div>
                )}
              </div>
              <div className="feed-copy">
                <p className="card-meta">{item.category?.name || 'Feature'}</p>
                <h3>{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Latest Stories</h2>
          <p>Updated continuously from the newsroom.</p>
        </div>
        <div className="list">
          {latest.map((item) => (
            <article key={item._id} className="list-item">
              <p className="card-meta">
                {item.category?.name || 'Story'} - {formatDate(item.publishedAt)}
              </p>
              <h3>
                <Link to={`/${item.category?.slug || 'story'}/${item.slug}`}>{item.title}</Link>
              </h3>
              <p>{item.excerpt}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
