import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import styles from './AdminConfirm.module.css';

export type AdminConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Delete-style primary action (red). Default: danger */
  variant?: 'danger' | 'default';
};

type PendingConfirm = AdminConfirmOptions & {
  resolve: (confirmed: boolean) => void;
};

const noopConfirm = async () => false;

const AdminConfirmContext = createContext<(options: AdminConfirmOptions) => Promise<boolean>>(noopConfirm);

export function useAdminConfirm(): (options: AdminConfirmOptions) => Promise<boolean> {
  return useContext(AdminConfirmContext);
}

export function AdminConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();

  const confirm = useCallback((options: AdminConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const close = useCallback((result: boolean) => {
    setPending((current) => {
      current?.resolve(result);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!pending) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close(false);
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => cancelRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
    };
  }, [pending, close]);

  const isDanger = pending?.variant !== 'default';

  return (
    <AdminConfirmContext.Provider value={confirm}>
      {children}
      {pending ? (
        <div className={styles.backdrop} onClick={() => close(false)}>
          <div
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={titleId} className={styles.title}>
              {pending.title ?? (isDanger ? 'Confirm delete' : 'Please confirm')}
            </h2>
            <p id={descId} className={styles.message}>
              {pending.message}
            </p>
            <div className={styles.actions}>
              <button
                ref={cancelRef}
                type="button"
                className={styles.cancelBtn}
                onClick={() => close(false)}
              >
                {pending.cancelLabel ?? 'Cancel'}
              </button>
              <button
                type="button"
                className={isDanger ? styles.confirmDanger : styles.confirmDefault}
                onClick={() => close(true)}
              >
                {pending.confirmLabel ?? (isDanger ? 'Delete' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminConfirmContext.Provider>
  );
}
