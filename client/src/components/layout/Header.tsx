import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMenu, FiX } from 'react-icons/fi';
import SearchModal from '@/components/common/SearchModal';

const navLinks = [
  { label: 'News', path: '/category/news' },
  { label: 'Things To Do', path: '/category/things-to-do' },
  { label: 'Food & Drink', path: '/category/food-drink' },
  { label: 'Lifestyle', path: '/category/lifestyle' },
  { label: 'Culture', path: '/category/culture' },
  { label: 'Travel', path: '/category/travel' },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMobileOpen(false); }, [location]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          isScrolled
            ? 'border-black/[0.08] bg-white/92 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.045)] backdrop-blur-xl'
            : 'border-black/[0.05] bg-white py-4'
        }`}
      >
        <div className="container-custom">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-5 lg:gap-8">
            <Link to="/" className="flex min-h-11 items-center gap-3 shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-[#141414] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <span className="text-white font-heading font-extrabold text-base">B</span>
              </div>
              <span className="font-heading text-[22px] font-extrabold tracking-[-0.045em] text-[#1a1a1a] hidden sm:block whitespace-nowrap">
                Dubai <span className="italic gradient-text">Blooms</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center justify-center gap-7 xl:gap-9">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative inline-flex min-h-10 items-center justify-center text-[11px] font-bold tracking-[0.11em] transition-colors duration-300
                      font-accent uppercase whitespace-nowrap after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:mx-auto after:h-px after:w-0 after:bg-[#b8942e] after:transition-all after:duration-300 hover:after:w-full
                      ${isActive
                        ? 'text-[#1a1a1a] after:w-full'
                        : 'text-[#666] hover:text-[#1a1a1a]'
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-full
                  text-[#666] hover:text-[#1a1a1a] hover:bg-[#f6f4ee]
                  transition-all duration-300 cursor-pointer"
                aria-label="Search"
              >
                <FiSearch size={18} />
              </button>

              <Link
                to="/admin/login"
                className="hidden sm:inline-flex min-h-10 items-center justify-center rounded-full border border-[#c9a84c]/55 px-4 py-2 text-[10px]
                  font-accent font-extrabold tracking-[0.12em] uppercase text-[#8b7430]
                  hover:bg-[#b8942e] hover:text-white hover:border-[#b8942e]
                  transition-all duration-300 whitespace-nowrap"
              >
                Subscribe
              </Link>

              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden h-10 w-10 rounded-full border border-black/[0.06] bg-white flex items-center justify-center
                  text-[#777] hover:text-[#1a1a1a] hover:bg-[#f5f4f1]
                  transition-all duration-300 cursor-pointer"
                aria-label="Toggle menu"
              >
                {isMobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden border-t border-black/[0.05] bg-white/95 backdrop-blur-xl"
            >
              <nav className="container-custom py-5 flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={link.path}
                      className={`block min-h-11 px-4 py-3 rounded-2xl text-[12px] font-accent font-bold 
                        uppercase tracking-[0.08em] transition-all duration-300
                        ${location.pathname === link.path
                          ? 'text-white bg-[#1a1a1a]'
                          : 'text-[#777] hover:text-[#1a1a1a] hover:bg-[#faf9f7]'
                        }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-3 pt-4 border-t border-black/[0.05]">
                  <Link
                    to="/admin/login"
                    className="flex min-h-12 items-center justify-center gap-1.5 w-full rounded-2xl px-5 py-3 text-[12px]
                      font-accent font-extrabold tracking-[0.1em] uppercase
                      bg-gradient-to-r from-[#b8942e] via-[#d4af37] to-[#c9a84c] text-[#14120d]"
                  >
                    Subscribe
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
