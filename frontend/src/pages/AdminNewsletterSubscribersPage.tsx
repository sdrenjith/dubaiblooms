import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { useAdminToast } from '@/context/AdminToastContext';
import type { Subscriber } from '@/types/api';

export function AdminNewsletterSubscribersPage() {
  const token = localStorage.getItem('adminToken');
  const toast = useAdminToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const list = await adminApi.getSubscribers(token);
      setSubscribers(list);
    } catch {
      toast('error', 'Unable to load subscribers. Check your session.');
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!token) {
    return null;
  }

  return (
    <div className="admin-app-panel">
      <div className="admin-screen-intro">
        <h1 className="admin-screen-title">Newsletter subscribers</h1>
        <p className="lede admin-screen-lede">
          Emails captured from the site footer signup form and other sources.{' '}
          {!loading ? (
            <strong>
              {subscribers.length} total
            </strong>
          ) : null}
        </p>
        <p className="lede admin-hint" style={{ marginTop: '0.5rem' }}>
          <button className="button-link" type="button" onClick={() => void load()} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh list'}
          </button>
        </p>
      </div>
      {loading ? <div className="status-banner">Loading subscribers…</div> : null}

      {!loading ? (
        <section className="admin-card admin-card-wide">
          <h2>Subscriber list</h2>
          {subscribers.length === 0 ? (
            <p className="lede">No subscribers yet.</p>
          ) : (
            <div className="admin-list">
              {subscribers.map((subscriber, idx) => (
                <div className="admin-row" key={`${subscriber.email}-${idx}`}>
                  <input value={subscriber.email} readOnly aria-label="Email" />
                  <input value={subscriber.source || 'website-footer'} readOnly aria-label="Source" />
                  <input
                    value={subscriber.subscribedAt ? new Date(subscriber.subscribedAt).toLocaleString() : '-'}
                    readOnly
                    aria-label="Subscribed at"
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
