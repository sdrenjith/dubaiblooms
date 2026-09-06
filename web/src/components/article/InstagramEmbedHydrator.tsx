'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { InstagramPromoCard } from './InstagramPromoCard';

const PLACEHOLDER_SELECTOR = '.db-instagram-embed[data-instagram-url]';

export type InstagramEmbedHydratorProps = {
  /** Scope query to article body only. */
  scopeSelector?: string;
  profileUrl?: string | null;
  avatarSrc?: string | null;
};

type EmbedTarget = {
  el: HTMLElement;
  postUrl: string;
};

function isSafeHttpUrl(raw: string | null): string | null {
  const value = raw?.trim();
  if (!value || !/^https?:\/\//i.test(value)) {
    return null;
  }
  return value;
}

/**
 * Finds `.db-instagram-embed` placeholders pasted into article HTML and mounts
 * the Instagram promo card into each one (client-side only).
 */
export function InstagramEmbedHydrator({
  scopeSelector = '.article-body',
  profileUrl,
  avatarSrc,
}: InstagramEmbedHydratorProps) {
  const [targets, setTargets] = useState<EmbedTarget[]>([]);

  useEffect(() => {
    const scope = document.querySelector(scopeSelector);
    if (!scope) {
      setTargets([]);
      return;
    }

    const found: EmbedTarget[] = [];
    scope.querySelectorAll<HTMLElement>(PLACEHOLDER_SELECTOR).forEach((el) => {
      const postUrl = isSafeHttpUrl(el.getAttribute('data-instagram-url'));
      if (!postUrl) {
        return;
      }
      el.replaceChildren();
      el.setAttribute('data-hydrated', 'true');
      found.push({ el, postUrl });
    });
    setTargets(found);
  }, [scopeSelector, profileUrl, avatarSrc]);

  return (
    <>
      {targets.map(({ el, postUrl }, index) =>
        createPortal(
          <InstagramPromoCard
            profileUrl={profileUrl}
            postUrl={postUrl}
            avatarSrc={avatarSrc}
            previewAlt="Instagram post"
            embedded
          />,
          el,
          `${postUrl}#${index}`
        )
      )}
    </>
  );
}
