import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

export interface ScrollChartRevealProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Optional key (such as active tab or date period) to replay
   * the bottom-to-top bar / left-to-right line reveal when switched.
   */
  triggerKey?: string | number;
  /**
   * Direction for bar growth animation. Defaults to 'vertical' (bottom-to-top).
   */
  barDirection?: 'vertical' | 'horizontal';
}

export const ScrollChartReveal: React.FC<ScrollChartRevealProps> = ({
  children,
  className = '',
  triggerKey,
  barDirection = 'vertical',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(containerRef, {
    once: true,
    amount: 0.2,
  });

  const [isRevealed, setIsRevealed] = useState<boolean>(Boolean(prefersReducedMotion));
  const prevTriggerKeyRef = useRef<string | number | undefined>(triggerKey);

  // Trigger reveal when scrolled into viewport
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }
    if (isInView) {
      const rafId = window.requestAnimationFrame(() => {
        setIsRevealed(true);
      });
      return () => window.cancelAnimationFrame(rafId);
    }
  }, [isInView, prefersReducedMotion]);

  // Replay smooth reveal when triggerKey changes while already in view
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }
    if (prevTriggerKeyRef.current !== triggerKey) {
      prevTriggerKeyRef.current = triggerKey;
      if (isInView) {
        setIsRevealed(false);
        const timerId = window.setTimeout(() => {
          setIsRevealed(true);
        }, 35);
        return () => window.clearTimeout(timerId);
      }
    }
  }, [triggerKey, isInView, prefersReducedMotion]);

  return (
    <motion.div
      ref={containerRef}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={
        prefersReducedMotion
          ? { opacity: 1, y: 0 }
          : isInView
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 12 }
      }
      transition={{
        duration: 0.52,
        ease: [0.16, 1, 0.3, 1],
      }}
      data-chart-revealed={isRevealed ? 'true' : 'false'}
      data-bar-direction={barDirection}
      className={`scroll-chart-reveal ${className}`}
    >
      {children}
    </motion.div>
  );
};
