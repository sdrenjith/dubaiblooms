import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import SEOHead from '@/components/common/SEOHead';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead title="Admin Login" />
      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-surface relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md glass-card p-6 sm:p-8 md:p-12"
        >
          <div className="text-center mb-8 sm:mb-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-text-primary flex items-center justify-center mx-auto mb-5 sm:mb-6">
              <span className="text-white font-heading font-bold text-3xl italic">B</span>
            </div>
            <h1 className="editorial-title text-3xl italic">Welcome Back</h1>
            <p className="text-text-muted text-sm mt-2 font-accent tracking-wide">Sign in to the editorial dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-accent text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dubaiblooms.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-surface-elevated border border-border
                    text-text-primary placeholder-text-muted outline-none text-sm
                    focus:border-primary/30 focus:shadow-[0_0_0_3px_rgba(185,148,46,0.06)] transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block font-accent text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-surface-elevated border border-border
                    text-text-primary placeholder-text-muted outline-none text-sm
                    focus:border-primary/30 focus:shadow-[0_0_0_3px_rgba(185,148,46,0.06)] transition-all"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary justify-center !py-4 !rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  Sign In
                  <FiArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
