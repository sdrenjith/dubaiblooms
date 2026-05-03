import type { Article } from '@/types';

export const generateArticleJsonLd = (article: Article, baseUrl: string = 'https://dubaiblooms.com') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.excerpt,
    image: article.seo?.ogImage || article.featuredImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author?.name || 'Dubai Blooms',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Dubai Blooms',
      logo: { '@type': 'ImageObject', url: `${baseUrl}/favicon.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${baseUrl}/${article.category?.slug}/${article.slug}` },
  };
};

export const generateOrganizationJsonLd = (baseUrl: string = 'https://dubaiblooms.com') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dubai Blooms',
    description: 'The Pulse of Dubai — your premium guide to the best things to do, eat, see, and experience.',
    url: baseUrl,
    logo: `${baseUrl}/favicon.svg`,
    sameAs: [
      'https://facebook.com/dubaiblooms',
      'https://twitter.com/dubaiblooms',
      'https://instagram.com/dubaiblooms',
    ],
  };
};
