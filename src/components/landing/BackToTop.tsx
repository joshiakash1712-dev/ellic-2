import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const shouldShow = window.scrollY > 320;
        setIsVisible((prev) => (prev !== shouldShow ? shouldShow : prev));
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          id="btn-back-to-top"
          type="button"
          aria-label="Scroll back to top"
          title="Scroll back to top"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          transition={{ duration: 0.2 }}
          className="website-btn-glow fixed bottom-6 sm:bottom-6 right-3.5 sm:right-6 z-40 p-2.5 sm:p-3 rounded-full glass-panel glass-panel-interactive text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-sky-400 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex items-center justify-center group cursor-pointer border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md"
          data-cursor="hover"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
