import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

export function AppShell() {
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowTopButton(window.scrollY > 360);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="app-shell">
      <Header />
      <main id="main-content" aria-live="polite">
        <Outlet />
      </main>
      <Footer />
      {showTopButton ? (
        <button
          className="scroll-top-btn"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      ) : null}
    </div>
  );
}
