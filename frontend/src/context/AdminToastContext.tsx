import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import styles from './AdminToast.module.css';

export type AdminToastVariant = 'success' | 'error';

type ToastItem = { id: string; variant: AdminToastVariant; message: string };

export const ADMIN_TOAST_MS = 4800;
const TOAST_MS = ADMIN_TOAST_MS;
const MAX_VISIBLE = 5;

const noopToast = (_variant: AdminToastVariant, _message: string) => {};

const AdminToastContext = createContext<(variant: AdminToastVariant, message: string) => void>(noopToast);

export function useAdminToast(): (variant: AdminToastVariant, message: string) => void {
  return useContext(AdminToastContext);
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
    }
    timers.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (variant: AdminToastVariant, message: string) => {
      const text = message.trim();
      if (!text) {
        return;
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      setToasts((prev) => [...prev, { id, variant, message: text }].slice(-MAX_VISIBLE));
      const tid = setTimeout(() => dismiss(id), TOAST_MS);
      timers.current.set(id, tid);
    },
    [dismiss]
  );

  useEffect(
    () => () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    },
    []
  );

  const value = useMemo(() => show, [show]);

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <div className={styles.stack} aria-live="polite" aria-relevant="additions text">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${styles.toast} ${styles[t.variant]}`}
            role="status"
            style={{ ['--admin-toast-ms' as string]: `${TOAST_MS}ms` }}
          >
            <span className={styles.iconWrap} aria-hidden>
              {t.variant === 'success' ? (
                <svg className={styles.iconSvg} viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg className={styles.iconSvg} viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <path
                    d="M12 8v5m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className={styles.text}>{t.message}</span>
            <button type="button" className={styles.close} aria-label="Dismiss notification" onClick={() => dismiss(t.id)}>
              <span aria-hidden>×</span>
            </button>
            <span className={styles.progress} aria-hidden />
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}
