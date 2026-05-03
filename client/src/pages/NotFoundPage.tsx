import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEOHead from '@/components/common/SEOHead';

const NotFoundPage = () => {
  return (
    <>
      <SEOHead title="404 — Page Not Found" />
      <div className="min-h-[75vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center px-6"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="editorial-title text-[140px] md:text-[200px] leading-none gradient-text italic"
          >
            404
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-text-muted text-lg mt-6 mb-10 max-w-md mx-auto leading-relaxed"
          >
            This page has wandered off into the desert dunes. Let's get you back on track.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link to="/" className="btn-primary">
              Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default NotFoundPage;
