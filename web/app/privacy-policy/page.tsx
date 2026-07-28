import type { Metadata } from 'next';
import { contentApi } from '@/lib/api';
import { prepareArticleBodyHtml } from '@/lib/articleContent';
import { resolvePageMeta, toNextMetadata } from '@/lib/seoMeta';

export const dynamic = 'force-dynamic';

const PAGE_PATH = '/privacy-policy';
const FALLBACK_TITLE = 'Privacy Policy';
const FALLBACK_DESCRIPTION = 'How Dubai Blooms collects, uses, and protects your information.';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await contentApi.settings();
  return toNextMetadata(
    resolvePageMeta(
      {},
      {
        title: FALLBACK_TITLE,
        description: FALLBACK_DESCRIPTION,
      },
      settings?.seoDefaults,
      settings?.siteName || 'Dubai Blooms',
      PAGE_PATH
    )
  );
}

export default async function PrivacyPolicyPage() {
  const settings = await contentApi.settings();
  const html =
    prepareArticleBodyHtml(settings?.privacyPolicyHtml) ||
    '<p>Privacy policy content is not available yet.</p>';

  return (
    <div className="page-wrap">
      <article className="article">
        <h1>Privacy Policy</h1>
        <p className="lede">How we collect, use, and protect information on Dubai Blooms.</p>
        <section className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  );
}
