import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found - Dubai Blooms',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="page-wrap section">
      <h1 className="section-title">The page cannot be found.</h1>
      <p>Return to the homepage to continue exploring the latest editorial stories.</p>
      <Link className="button-link" href="/">
        Back to Home
      </Link>
    </div>
  );
}
