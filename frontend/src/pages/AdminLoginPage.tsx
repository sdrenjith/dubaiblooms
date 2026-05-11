import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotDevHint, setForgotDevHint] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('adminToken', data.token);
      navigate('/admin/settings', { replace: true });
    } catch {
      setError('Invalid login credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const openForgot = () => {
    setShowForgot(true);
    setForgotEmail(email.trim());
    setForgotMessage(null);
    setForgotDevHint(null);
    setForgotError(null);
  };

  const onForgotSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setForgotError(null);
    setForgotMessage(null);
    setForgotDevHint(null);
    if (!forgotEmail.trim()) {
      setForgotError('Enter the email for your admin account.');
      return;
    }
    setForgotSubmitting(true);
    try {
      const result = await authApi.requestPasswordReset(forgotEmail.trim());
      setForgotMessage(result.message);
      if (result.resetUrl) {
        setForgotDevHint(result.resetUrl);
      } else {
        setForgotDevHint(null);
      }
    } catch {
      setForgotError('Could not start password reset. Try again later.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div className="admin-login-shell">
      <div className="admin-auth">
        <div className="admin-auth-header">
          <h1 className="admin-auth-title">Admin Login</h1>
          <p className="admin-auth-lede">Sign in to manage homepage sections and site settings.</p>
        </div>
        {error ? <div className="status-banner admin-auth-banner">{error}</div> : null}

        {!showForgot ? (
          <>
            <form className="admin-form admin-login-form" onSubmit={onSubmit}>
              <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </label>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            <div className="admin-auth-actions">
              <button type="button" className="admin-auth-link" onClick={openForgot}>
                Forgot password?
              </button>
              <Link to="/" className="admin-auth-link">
                Go back to home
              </Link>
            </div>
          </>
        ) : (
          <>
            <form className="admin-form admin-login-form admin-forgot-form" onSubmit={onForgotSubmit}>
              <p className="admin-forgot-intro">We’ll issue a one-hour reset link. Use the URL from the server log, or open the reset page if you’re in development.</p>
              <label>
                Account email
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>
              <button type="submit" disabled={forgotSubmitting}>
                {forgotSubmitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            {forgotError ? <div className="status-banner admin-auth-banner">{forgotError}</div> : null}
            {forgotMessage ? (
              <div className="status-banner admin-auth-banner admin-auth-success">
                <p className="admin-forgot-msg">{forgotMessage}</p>
                {forgotDevHint ? (
                  <>
                    <p className="admin-forgot-dev-label">Development — use this link:</p>
                    <pre className="admin-forgot-pre">{forgotDevHint}</pre>
                  </>
                ) : (
                  <p className="admin-forgot-prod-hint">
                    No browser link is shown in production. For a registered email, the API logs a line starting with{' '}
                    <code>[password-reset]</code> with the full URL. If nothing appears, the email may not exist—or add{' '}
                    <code>CLIENT_URL</code> on the server and use development mode for an in-app link.
                  </p>
                )}
                <p className="admin-forgot-next">
                  <Link to="/admin/reset-password">Open reset password</Link> (paste the token if you are not using the full URL).
                </p>
              </div>
            ) : null}
            <div className="admin-auth-actions">
              <button
                type="button"
                className="admin-auth-link"
                onClick={() => {
                  setShowForgot(false);
                  setForgotMessage(null);
                  setForgotDevHint(null);
                  setForgotError(null);
                }}
              >
                ← Back to sign in
              </button>
              <Link to="/" className="admin-auth-link">
                Go back to home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
