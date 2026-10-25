import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

type CursorMode = 'default' | 'hover' | 'card' | 'text' | 'clicking';

export const WebsiteCursor: React.FC = () => {
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorMode, setCursorMode] = useState<CursorMode>('default');
  const isVisibleRef = useRef(false);
  const cursorModeRef = useRef<CursorMode>('default');

  // Exact mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring physics for outer trailing aura ring (tuned for 120fps fluid response)
  const springConfig = { damping: 28, stiffness: 340, mass: 0.3 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only enable on devices with fine pointer (mouse/trackpad, not touchscreens)
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsFinePointer(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsFinePointer(e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    if (!mediaQuery.matches) {
      return () => mediaQuery.removeEventListener('change', handleMediaChange);
    }

    const updateCursorMode = (nextMode: CursorMode) => {
      if (cursorModeRef.current !== nextMode) {
        cursorModeRef.current = nextMode;
        setCursorMode(nextMode);
      }
    };

    const resolveCursorMode = (target: HTMLElement | null): CursorMode => {
      if (!target) return 'default';
      if (target.closest('[data-cursor="hover"]')) return 'hover';
      if (target.closest('[data-cursor="card"], .website-interactive-card, [data-spotlight="card"]')) return 'card';
      if (target.closest('button, a, input, select, textarea, [role="button"], label, summary')) return 'hover';
      return 'default';
    };

    // High-performance coordinate tracker: zero DOM queries, pure MotionValue update
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };

    // Hover state inspector: only runs on element boundary transitions (mouseover), not on every pixel
    const handleMouseOver = (e: MouseEvent) => {
      updateCursorMode(resolveCursorMode(e.target as HTMLElement | null));
    };

    const handleMouseDown = () => {
      updateCursorMode('clicking');
    };

    const handleMouseUp = (e: MouseEvent) => {
      updateCursorMode(resolveCursorMode(e.target as HTMLElement | null));
    };

    const handleMouseLeave = () => {
      if (isVisibleRef.current) {
        isVisibleRef.current = false;
        setIsVisible(false);
      }
    };

    const handleMouseEnter = () => {
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY]);

  if (!isFinePointer) {
    return null;
  }

  // Determine size, color & scale based on cursor mode
  let auraSize = 34;
  let auraBorder = 'border-sky-500/40 dark:border-sky-400/50';
  let auraBg = 'bg-sky-500/5 dark:bg-sky-400/10';
  let auraShadow = 'shadow-[0_0_12px_rgba(37, 99, 235,0.12)]';
  let auraScale = 1;

  if (cursorMode === 'hover') {
    auraSize = 58;
    auraBorder = 'border-sky-400 dark:border-sky-300';
    auraBg = 'bg-sky-400/15 dark:bg-sky-400/20';
    auraShadow = 'shadow-[0_0_24px_rgba(56, 189, 248,0.35)]';
    auraScale = 1.05;
  } else if (cursorMode === 'card') {
    auraSize = 68;
    auraBorder = 'border-sky-400/60 dark:border-sky-400/60';
    auraBg = 'bg-sky-500/8 dark:bg-sky-400/12';
    auraShadow = 'shadow-[0_0_28px_rgba(20,184,166,0.25)]';
    auraScale = 1.02;
  } else if (cursorMode === 'clicking') {
    auraSize = 26;
    auraBorder = 'border-sky-300 dark:border-sky-200';
    auraBg = 'bg-sky-500/30 dark:bg-sky-400/40';
    auraShadow = 'shadow-[0_0_16px_rgba(37, 99, 235,0.5)]';
    auraScale = 0.9;
  }

  return (
    <div
      id="website-custom-cursor-container"
      className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Precision Center Dot (Tracks directly without lag) */}
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 -ml-[5px] -mt-[5px] rounded-full bg-gradient-to-tr from-blue-600 via-sky-400 to-sky-200 shadow-[0_0_10px_rgba(37, 99, 235,0.9)] ring-1 ring-white/70"
        style={{
          x: mouseX,
          y: mouseY,
          willChange: 'transform',
          transform: 'translateZ(0)',
          opacity: isVisible ? (cursorMode === 'hover' ? 0.3 : 1) : 0,
          scale: cursorMode === 'clicking' ? 0.75 : 1,
        }}
        transition={{ duration: 0.08 }}
      />

      {/* 2. Outer Trailing Aura Ring with smooth spring lag & reactive styling */}
      <motion.div
        className={`fixed top-0 left-0 rounded-full border transition-[border-color,background-color,box-shadow] duration-200 ${auraBorder} ${auraBg} ${auraShadow}`}
        style={{
          x: smoothX,
          y: smoothY,
          willChange: 'transform',
          transform: 'translateZ(0)',
          width: auraSize,
          height: auraSize,
          marginLeft: -auraSize / 2,
          marginTop: -auraSize / 2,
          opacity: isVisible ? 1 : 0,
          scale: auraScale,
        }}
        transition={{
          width: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
          height: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
          marginLeft: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
          marginTop: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 0.18 },
        }}
      >
        {/* Subtle inner ambient focus ring when hovering clickable item */}
        {cursorMode === 'hover' && (
          <div className="w-full h-full rounded-full opacity-30 border border-sky-400 animate-pulse" />
        )}
      </motion.div>
    </div>
  );
};
