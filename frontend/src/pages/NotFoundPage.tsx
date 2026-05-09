import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="page-wrap section">
      <h1 className="section-title">The page cannot be found.</h1>
      <p>Return to the homepage to continue exploring the latest editorial stories.</p>
      <Link className="button-link" to="/">
        Back to Home
      </Link>
    </div>
  );
}
