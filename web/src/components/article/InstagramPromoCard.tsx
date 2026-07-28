'use client';

import { useMemo, useState } from 'react';
import styles from './InstagramPromoCard.module.css';

const DEFAULT_INSTAGRAM = 'https://www.instagram.com/dubai.blooms?igsh=MXM0bGR4ZGhhZjByNg==';

export type InstagramPromoCardProps = {
  profileUrl?: string | null;
  /** Per-article Instagram post URL. When set, primary outbound links use this instead of the profile. */
  postUrl?: string | null;
  username?: string | null;
  followerLabel?: string | null;
  avatarSrc?: string | null;
  images?: string[];
  previewAlt?: string;
};

function normalizeInstagramUrl(raw?: string | null): string | null {
  const value = raw?.trim();
  if (value && /^https?:\/\//i.test(value) && value !== '#') {
    return value;
  }
  return null;
}

function normalizeProfileUrl(raw?: string | null): string {
  return normalizeInstagramUrl(raw) || DEFAULT_INSTAGRAM;
}

function deriveUsername(profileUrl: string, explicit?: string | null): string {
  const fromProp = explicit?.trim().replace(/^@/, '');
  if (fromProp) {
    return fromProp;
  }
  try {
    const path = new URL(profileUrl).pathname.replace(/^\/+|\/+$/g, '');
    const handle = path.split('/')[0]?.trim();
    if (handle && !['p', 'reel', 'reels', 'stories', 'explore'].includes(handle.toLowerCase())) {
      return handle;
    }
  } catch {
    /* ignore */
  }
  return 'dubai.blooms';
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C6.118 14.081 3.5 12.194 3.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.656 17.008a9.781 9.781 0 0 1-2.712 2.71c-3.918 2.3-8.98 1.386-11.847-1.962a9.76 9.76 0 0 1-2.772-6.21c0-5.445 4.41-9.855 9.855-9.855 2.654 0 5.05 1.048 6.807 2.745a9.788 9.788 0 0 1 2.74 6.814 9.763 9.763 0 0 1-2.07 6.258z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 3 10.5 14.5" />
      <path d="M22 3 15 21l-4.5-6.5L3 11z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.5L6 20V5.5a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11.25 1.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7.5A4.5 4.5 0 1 1 12 16.5 4.5 4.5 0 0 1 12 7.5zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
    </svg>
  );
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4">
      {dir === 'left' ? <path d="M15 5 8 12l7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );
}

export function InstagramPromoCard({
  profileUrl,
  postUrl,
  username,
  followerLabel,
  avatarSrc,
  images = [],
  previewAlt = 'Dubai Blooms on Instagram',
}: InstagramPromoCardProps) {
  const profileHref = normalizeProfileUrl(profileUrl);
  const postHref = normalizeInstagramUrl(postUrl) || profileHref;
  const handle = deriveUsername(profileHref, username);
  const slides = useMemo(() => images.map((src) => src.trim()).filter(Boolean), [images]);
  const [index, setIndex] = useState(0);
  const safeIndex = slides.length ? Math.min(index, slides.length - 1) : 0;
  const currentSrc = slides[safeIndex] || '';
  const multi = slides.length > 1;
  const subtitle = followerLabel?.trim() || 'Follow us on Instagram';
  const monogram = handle.charAt(0).toUpperCase() || 'D';

  const go = (delta: number) => {
    if (!multi) return;
    setIndex((prev) => {
      const next = (prev + delta + slides.length) % slides.length;
      return next;
    });
  };

  return (
    <aside className={styles.wrap} aria-label="Follow Dubai Blooms on Instagram">
      <div className={styles.card}>
        <div className={styles.header}>
          <a className={styles.avatarLink} href={profileHref} target="_blank" rel="noopener noreferrer" aria-label={`${handle} on Instagram`}>
            {avatarSrc ? (
              <img className={styles.avatar} src={avatarSrc} alt="" />
            ) : (
              <span className={styles.avatarFallback}>{monogram}</span>
            )}
          </a>
          <div className={styles.identity}>
            <a className={styles.username} href={profileHref} target="_blank" rel="noopener noreferrer">
              {handle}
            </a>
            <span className={styles.followers}>{subtitle}</span>
          </div>
          <a className={styles.viewProfile} href={profileHref} target="_blank" rel="noopener noreferrer">
            View profile
          </a>
        </div>

        <div className={styles.media}>
          <a className={styles.mediaLink} href={postHref} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
            {currentSrc ? (
              <img className={styles.mediaImg} src={currentSrc} alt={previewAlt} />
            ) : (
              <div className={styles.mediaPlaceholder}>Instagram</div>
            )}
          </a>
          {multi ? (
            <>
              <button type="button" className={`${styles.navBtn} ${styles.navPrev}`} onClick={() => go(-1)} aria-label="Previous image">
                <Chevron dir="left" />
              </button>
              <button type="button" className={`${styles.navBtn} ${styles.navNext}`} onClick={() => go(1)} aria-label="Next image">
                <Chevron dir="right" />
              </button>
              <div className={styles.dots} aria-hidden="true">
                {slides.map((_, i) => (
                  <span key={i} className={`${styles.dot}${i === safeIndex ? ` ${styles.dotActive}` : ''}`} />
                ))}
              </div>
            </>
          ) : null}
        </div>

        <a className={styles.viewMore} href={postHref} target="_blank" rel="noopener noreferrer">
          View more on Instagram
        </a>

        <div className={styles.actions}>
          <div className={styles.actionsLeft}>
            <a className={styles.iconBtn} href={postHref} target="_blank" rel="noopener noreferrer" aria-label="Like on Instagram">
              <HeartIcon />
            </a>
            <a className={styles.iconBtn} href={postHref} target="_blank" rel="noopener noreferrer" aria-label="Comment on Instagram">
              <CommentIcon />
            </a>
            <a className={styles.iconBtn} href={postHref} target="_blank" rel="noopener noreferrer" aria-label="Share on Instagram">
              <ShareIcon />
            </a>
          </div>
          <a className={styles.iconBtn} href={postHref} target="_blank" rel="noopener noreferrer" aria-label="Save on Instagram">
            <BookmarkIcon />
          </a>
        </div>

        <a className={styles.likes} href={postHref} target="_blank" rel="noopener noreferrer">
          See posts on Instagram
        </a>

        <div className={styles.commentRow}>
          <a className={styles.commentPlaceholder} href={postHref} target="_blank" rel="noopener noreferrer">
            Add a comment...
          </a>
          <a className={styles.igMark} href={postHref} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <InstagramGlyph />
          </a>
        </div>
      </div>
    </aside>
  );
}
