import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/lib/api';

export function AdminResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get('token')?.trim() || '';
  const navigate = useNavigate();

  const [token, setToken] = useState(tokenFromQuery);

  useEffect(() => {
    setToken(tokenFromQuery);
  }, [tokenFromQuery]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    if (!token.trim()) {
      setError('Reset token is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await authApi.resetPassword(token.trim(), password);
      setStatus(result.message);
      setPassword('');
      setConfirm('');
      window.setTimeout(() => navigate('/admin/login', { replace: true }), 1800);
    } catch {
      setError('Could not reset password. The link may have expired—request a new one from the login page.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-shell">
      <div className="admin-auth">
        <div className="admin-auth-header">
          <h1 className="admin-auth-title">Set new password</h1>
          <p className="admin-auth-lede">Enter the token from your reset link (or server log in development) and choose a new password.</p>
        </div>
        {error ? <div className="status-banner admin-auth-banner">{error}</div> : null}
        {status ? <div className="status-banner admin-auth-banner admin-auth-success">{status}</div> : null}
        <form className="admin-form admin-login-form" onSubmit={onSubmit}>
          <label>
            Reset token
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              autoComplete="one-time-code"
              placeholder="Paste token if not in URL"
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
        <p className="admin-auth-footer">
          <Link to="/admin/login">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
