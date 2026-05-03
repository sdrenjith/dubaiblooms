import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogUrl?: string;
  type?: string;
  jsonLd?: object;
}

const SEOHead = ({
  title = 'Dubai Blooms — The Pulse of Dubai',
  description = 'Your premium guide to Dubai — the best things to do, eat, see, and experience in the city.',
  ogImage = '/favicon.svg',
  ogUrl = 'https://dubaiblooms.com',
  type = 'website',
  jsonLd,
}: SEOHeadProps) => {
  const fullTitle = title.includes('Dubai Blooms') ? title : `${title} | Dubai Blooms`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Dubai Blooms" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEOHead;
