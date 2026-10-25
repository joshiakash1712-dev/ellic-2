import React from 'react';

export type LogoVariant = 'full' | 'symbol' | 'text';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type LogoFormat = 'svg' | 'png' | 'auto';

export interface EllixConnectLogoProps {
  /**
   * Display mode:
   * - 'full': Official 3D Ribbon Symbol + 'ellix' wordmark + tracked 'CONNECT'
   * - 'symbol': 3D Ribbon Symbol + Floating Mint Orb only
   * - 'text': Wordmark typography only
   */
  variant?: LogoVariant;
  /**
   * Predefined sizes or custom height string
   * xs: height ~22px
   * sm: height ~28px
   * md: height ~36px (default)
   * lg: height ~44px
   * xl: height ~54px
   * 2xl: height ~64px
   */
  size?: LogoSize | number;
  /**
   * Rendering format:
   * - 'svg': Crisp vector rendering for pixel-perfect display at any DPI (default)
   * - 'png': Official raster PNG asset from /assets/logo/
   * - 'auto': Uses SVG for vector clarity and retina sharpness
   */
  format?: LogoFormat;
  /** Optional click handler or navigation link */
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  /** Additional custom classNames for wrapping element */
  className?: string;
  /** Accessible label */
  alt?: string;
  /** Whether to show a subtle hover effect when clickable */
  interactive?: boolean;
}

const SIZE_MAP: Record<LogoSize, { height: number; fullWidth: number; symbolWidth: number }> = {
  xs: { height: 22, fullWidth: 91, symbolWidth: 22 },
  sm: { height: 28, fullWidth: 116, symbolWidth: 28 },
  md: { height: 36, fullWidth: 149, symbolWidth: 36 },
  lg: { height: 44, fullWidth: 182, symbolWidth: 44 },
  xl: { height: 54, fullWidth: 223, symbolWidth: 54 },
  '2xl': { height: 64, fullWidth: 265, symbolWidth: 64 }
};

export const EllixConnectLogo: React.FC<EllixConnectLogoProps> = ({
  variant = 'full',
  size = 'md',
  format = 'auto',
  href,
  onClick,
  className = '',
  alt = 'Ellic - Business management, without the complexity',
  interactive = false
}) => {
  // Resolve dimensions
  let height: number;
  let width: number;

  if (typeof size === 'number') {
    height = size;
    width = variant === 'symbol' ? size : Math.round(size * 4.13);
  } else {
    const metrics = SIZE_MAP[size] || SIZE_MAP.md;
    height = metrics.height;
    width = variant === 'symbol' ? metrics.symbolWidth : metrics.fullWidth;
  }

  const isClickable = Boolean(href || onClick || interactive);
  const clickClasses = isClickable
    ? 'cursor-pointer transition-opacity duration-200 hover:opacity-90 active:scale-[0.98]'
    : '';

  // Render PNG asset if explicitly requested
  if (format === 'png') {
    const pngSrc =
      variant === 'symbol'
        ? '/assets/logo/ellix-connect-symbol.png'
        : '/assets/logo/ellix-connect-logo.png';

    const imageElement = (
      <img
        src={pngSrc}
        alt={alt}
        width={width}
        height={height}
        className={`object-contain shrink-0 select-none ${clickClasses} ${className}`}
        style={{ height: `${height}px`, width: variant === 'symbol' ? `${height}px` : 'auto' }}
        loading="eager"
        decoding="async"
      />
    );

    if (href) {
      return (
        <a href={href} onClick={onClick} className="inline-flex items-center shrink-0" aria-label={alt}>
          {imageElement}
        </a>
      );
    }

    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center p-0 border-0 bg-transparent shrink-0"
          aria-label={alt}
        >
          {imageElement}
        </button>
      );
    }

    return imageElement;
  }

  // Pure Vector SVG Rendering (for zero pixelation and 100% crisp retina rendering)
  let content: React.ReactNode;

  if (variant === 'symbol') {
    content = (
      <svg
        viewBox="0 0 160 160"
        width={height}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none ${clickClasses} ${className}`}
        role="img"
        aria-label={alt}
      >
        <defs>
          <filter id="ec-sym-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="ec-sym-top-surf" x1="20%" y1="70%" x2="80%" y2="20%">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="25%" stopColor="#2563EB" />
            <stop offset="55%" stopColor="#3B82F6" />
            <stop offset="85%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </linearGradient>
          <linearGradient id="ec-sym-cradle-surf" x1="15%" y1="20%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="35%" stopColor="#2563EB" />
            <stop offset="70%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="ec-sym-inner-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#082F49" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#0C4A6E" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0369A1" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="ec-sym-rim-glow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
            <stop offset="30%" stopColor="#38BDF8" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#BAE6FD" stopOpacity="1" />
            <stop offset="100%" stopColor="#F0F9FF" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id="ec-sym-sphere-grad" cx="35%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#F0F9FF" />
            <stop offset="20%" stopColor="#BAE6FD" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="80%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#082F49" />
          </radialGradient>
        </defs>
        <circle cx="80" cy="80" r="54" fill="#38BDF8" opacity="0.15" filter="url(#ec-sym-glow)" />
        <g transform="translate(4, 2)">
          <path
            d="M 52 82 C 42 66 52 48 68 38 C 84 28 102 34 112 46 C 104 54 84 68 66 80 Z"
            fill="url(#ec-sym-inner-shadow)"
          />
          <path
            d="M 54 94 C 44 104 46 116 56 122 C 68 128 86 126 102 114 C 112 106 116 96 114 90"
            stroke="url(#ec-sym-cradle-surf)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 38 78 C 30 64 36 44 52 32 C 70 20 96 22 112 36 C 124 46 126 62 118 72 C 108 82 86 96 64 108 C 50 114 40 108 38 96 C 36 84 46 72 62 60 C 76 50 94 48 106 58"
            stroke="url(#ec-sym-top-surf)"
            strokeWidth="15.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 38 78 C 30 64 36 44 52 32 C 70 20 96 22 112 36 C 124 46 126 62 118 72"
            stroke="url(#ec-sym-rim-glow)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            filter="url(#ec-sym-glow)"
          />
          <path
            d="M 116 70 C 102 82 82 94 62 106"
            stroke="#7DD3FC"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          <path
            d="M 58 122 C 70 128 88 124 104 112 C 114 104 116 96 114 90"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
          <g transform="translate(108, 88)">
            <ellipse cx="0" cy="11" rx="9" ry="3.5" fill="#082F49" opacity="0.45" />
            <circle cx="0" cy="0" r="12.5" fill="url(#ec-sym-sphere-grad)" />
            <circle cx="-3.5" cy="-3.5" r="3" fill="#FFFFFF" opacity="0.85" />
            <circle cx="-1.5" cy="-1.5" r="1.2" fill="#FFFFFF" opacity="0.95" />
          </g>
        </g>
      </svg>
    );
  } else if (variant === 'text') {
    content = (
      <div className={`flex flex-col justify-center leading-none select-none ${clickClasses} ${className}`}>
        <div className="flex items-baseline font-black tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
          <span style={{ fontSize: `${height * 0.72}px` }}>ell</span>
          <span className="relative inline-block" style={{ fontSize: `${height * 0.72}px` }}>
            i
            <span
              className="absolute rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]"
              style={{
                top: `${height * 0.08}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                width: `${height * 0.16}px`,
                height: `${height * 0.16}px`
              }}
            />
          </span>
          <span style={{ fontSize: `${height * 0.72}px` }}>
            <span className="text-white">c</span>
          </span>
        </div>
        <div
          className="font-bold text-[#38BDF8] tracking-[0.38em] uppercase"
          style={{ fontSize: `${height * 0.28}px`, marginTop: `${height * 0.08}px` }}
        >
          BUSINESS OS
        </div>
      </div>
    );
  } else {
    // variant === 'full'
    content = (
      <svg
        viewBox="0 0 380 92"
        height={height}
        width={width}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none ${clickClasses} ${className}`}
        role="img"
        aria-label={alt}
      >
        <defs>
          <linearGradient id="ec-fl-top-surf" x1="20%" y1="70%" x2="80%" y2="20%">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="25%" stopColor="#2563EB" />
            <stop offset="55%" stopColor="#3B82F6" />
            <stop offset="85%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </linearGradient>
          <linearGradient id="ec-fl-cradle-surf" x1="15%" y1="20%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="35%" stopColor="#2563EB" />
            <stop offset="70%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="ec-fl-rim-glow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
            <stop offset="30%" stopColor="#38BDF8" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#BAE6FD" stopOpacity="1" />
            <stop offset="100%" stopColor="#F0FDF4" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id="ec-fl-sphere-grad" cx="35%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#F0F9FF" />
            <stop offset="20%" stopColor="#BAE6FD" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="80%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#082F49" />
          </radialGradient>
          <radialGradient id="ec-fl-i-dot" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#F0F9FF" />
            <stop offset="40%" stopColor="#38BDF8" />
            <stop offset="85%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#082F49" />
          </radialGradient>
        </defs>

        {/* 3D Symbol on Left */}
        <g transform="translate(6, 6) scale(0.52)">
          <path
            d="M 54 94 C 44 104 46 116 56 122 C 68 128 86 126 102 114 C 112 106 116 96 114 90"
            stroke="url(#ec-fl-cradle-surf)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 38 78 C 30 64 36 44 52 32 C 70 20 96 22 112 36 C 124 46 126 62 118 72 C 108 82 86 96 64 108 C 50 114 40 108 38 96 C 36 84 46 72 62 60 C 76 50 94 48 106 58"
            stroke="url(#ec-fl-top-surf)"
            strokeWidth="15.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 38 78 C 30 64 36 44 52 32 C 70 20 96 22 112 36 C 124 46 126 62 118 72"
            stroke="url(#ec-fl-rim-glow)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 116 70 C 102 82 82 94 62 106"
            stroke="#7DD3FC"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          <g transform="translate(108, 88)">
            <ellipse cx="0" cy="11" rx="9" ry="3.5" fill="#082F49" opacity="0.4" />
            <circle cx="0" cy="0" r="12.5" fill="url(#ec-fl-sphere-grad)" />
            <circle cx="-3.5" cy="-3.5" r="3" fill="#FFFFFF" opacity="0.85" />
          </g>
        </g>

        {/* Wordmark Typography on Right */}
        <g transform="translate(100, 0)">
          {/* 'e' */}
          <path
            className="ellix-logo-wordmark"
            d="M 23 48 C 23 38 31 31 42 31 C 53 31 60 38 60 49 C 60 50.5 59.8 51.5 59.5 52.5 L 31.8 52.5 C 32.5 58 36.5 61.5 42.5 61.5 C 47 61.5 50.5 59.5 52.5 57 L 58.5 60 C 55 64.5 49.5 67.5 42 67.5 C 30.5 67.5 23 59.5 23 48 Z M 51.2 46.5 C 50.8 41.5 47 37.5 41.8 37.5 C 36.8 37.5 33 41.2 32.2 46.5 L 51.2 46.5 Z"
            fill="#FFFFFF"
          />

          {/* first 'l' */}
          <path className="ellix-logo-wordmark" d="M 67 19 L 75.5 19 L 75.5 66.5 L 67 66.5 Z" fill="#FFFFFF" />

          {/* second 'l' */}
          <path className="ellix-logo-wordmark" d="M 83 19 L 91.5 19 L 91.5 66.5 L 83 66.5 Z" fill="#FFFFFF" />

          {/* 'i' stem */}
          <path className="ellix-logo-wordmark" d="M 99 32 L 107.5 32 L 107.5 66.5 L 99 66.5 Z" fill="#FFFFFF" />

          {/* 'i' dot: 3D mint orb */}
          <circle cx="103.25" cy="22" r="5.2" fill="url(#ec-fl-i-dot)" />
          <circle cx="101.8" cy="20.5" r="1.5" fill="#FFFFFF" opacity="0.8" />

          {/* 'c' main body */}
          <path
            className="ellix-logo-wordmark"
            d="M 148 42 C 145.5 35 139 31 130 31 C 118 31 111 39 111 49 C 111 59 118 67.5 130 67.5 C 139 67.5 145.5 63.5 148 56.5 L 139.5 53 C 138 56.5 134.5 59.5 130 59.5 C 123 59.5 119 54.5 119 49 C 119 43.5 123 38.5 130 38.5 C 134.5 38.5 138 41.5 139.5 45 Z"
            fill="#FFFFFF"
          />

          {/* 'c' sapphire top accent */}
          <path
            d="M 139.5 34 C 143 36 146 38.5 148 42 L 140 45 C 139 43 137.5 41 135 39.5 Z"
            fill="#38BDF8"
          />

          {/* Tracked Tagline: BUSINESS OS */}
          <text
            x="24"
            y="82"
            fill="#38BDF8"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", sans-serif',
              fontWeight: 700,
              fontSize: '11.5px',
              letterSpacing: '0.38em'
            }}
          >
            BUSINESS OS
          </text>
        </g>
      </svg>
    );
  }

  if (href) {
    return (
      <a href={href} onClick={onClick} className="inline-flex items-center shrink-0" aria-label={alt}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center p-0 border-0 bg-transparent shrink-0"
        aria-label={alt}
      >
        {content}
      </button>
    );
  }

  return <div className="inline-flex items-center shrink-0">{content}</div>;
};

export const EllicLogo = EllixConnectLogo;
export type EllicLogoProps = EllixConnectLogoProps;
