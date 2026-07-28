import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollTopButton } from '@/components/layout/ScrollTopButton';
import { contentApi } from '@/lib/api';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dubaiblooms.ae'),
  title: 'Dubai Blooms',
  icons: {
    icon: [{ url: '/favicon.ico?v=20260726b', type: 'image/x-icon' }],
  },
  verification: {
    google: 'Ec8wFDZEvKKZFj-EKisSDQF6ot_mjXqLSfUWmWVEs20',
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [settings, categories] = await Promise.all([contentApi.settings(), contentApi.categories()]);

  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TB9965HQ');",
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TB9965HQ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <div className="app-shell">
          <Header settings={settings} categories={categories} />
          <main id="main-content" aria-live="polite">
            {children}
          </main>
          <Footer settings={settings} categories={categories} />
          <ScrollTopButton />
        </div>
      </body>
    </html>
  );
}
