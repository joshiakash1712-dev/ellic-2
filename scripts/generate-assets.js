import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 1. Symbol Only SVG
const symbolSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" fill="none">
  <defs>
    <!-- Ribbon Front Face Gradient -->
    <linearGradient id="sym-front-grad" x1="15%" y1="90%" x2="85%" y2="15%">
      <stop offset="0%" stop-color="#047857" />
      <stop offset="30%" stop-color="#10B981" />
      <stop offset="65%" stop-color="#2DD4A7" />
      <stop offset="100%" stop-color="#6EE7B7" />
    </linearGradient>

    <!-- Ribbon Shadow/Fold Gradient -->
    <linearGradient id="sym-shadow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064E3B" />
      <stop offset="60%" stop-color="#047857" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>

    <!-- Specular Rim Light -->
    <linearGradient id="sym-highlight-grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.1" />
      <stop offset="50%" stop-color="#5EEAD4" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#E6FFFA" stop-opacity="0.95" />
    </linearGradient>

    <!-- Floating Orb Radial 3D Gradient -->
    <radialGradient id="orb-3d" cx="36%" cy="34%" r="62%">
      <stop offset="0%" stop-color="#CCFBF1" />
      <stop offset="28%" stop-color="#5EEAD4" />
      <stop offset="65%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#064E3B" />
    </radialGradient>

    <!-- Soft Ambient Glow -->
    <filter id="soft-glow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="7" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Group with subtle brand center alignment -->
  <g transform="translate(10, 8)">
    <!-- Back Loop Curve (Fold Underneath) -->
    <path
      d="M 52 92 C 32 86 24 64 36 46 C 46 30 72 24 96 34 C 114 42 122 62 116 80 C 110 94 92 108 72 114 C 54 120 38 116 28 106"
      stroke="url(#sym-shadow-grad)"
      stroke-width="17"
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.75"
    />

    <!-- Main Front 3D Helix Ribbon (The Ellix Loop) -->
    <path
      d="M 28 106 C 18 94 18 72 32 54 C 44 38 68 28 92 34 C 112 40 120 58 116 74 C 110 94 88 110 64 112 C 48 114 38 108 34 98 C 30 88 38 76 50 68 C 66 58 88 56 102 66"
      stroke="url(#sym-front-grad)"
      stroke-width="16"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Inner Highlight Spine (Gives the ribbon realistic 3D gloss reflection) -->
    <path
      d="M 32 54 C 44 38 68 28 92 34 C 112 40 120 58 116 74 C 110 94 88 110 64 112"
      stroke="url(#sym-highlight-grad)"
      stroke-width="3.5"
      stroke-linecap="round"
      fill="none"
      opacity="0.9"
    />

    <!-- Secondary Accent Crest -->
    <path
      d="M 44 72 C 58 63 78 61 90 70"
      stroke="#5EEAD4"
      stroke-width="2.5"
      stroke-linecap="round"
      fill="none"
      opacity="0.7"
    />

    <!-- The Floating 3D Emerald-Mint Orb -->
    <g transform="translate(68, 76)">
      <!-- Soft orb shadow -->
      <ellipse cx="0" cy="11" rx="10" ry="4" fill="#042F2E" opacity="0.45" filter="url(#soft-glow)" />
      <!-- Glowing Sphere Body -->
      <circle cx="0" cy="0" r="13" fill="url(#orb-3d)" />
      <!-- Specular Highlight Dot -->
      <circle cx="-4" cy="-4" r="3.2" fill="#FFFFFF" opacity="0.8" />
    </g>
  </g>
</svg>`;

// 2. Full Logo SVG (Symbol + Typography)
const fullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 92" width="380" height="92" fill="none">
  <defs>
    <!-- Ribbon Front Face Gradient -->
    <linearGradient id="fl-front-grad" x1="15%" y1="90%" x2="85%" y2="15%">
      <stop offset="0%" stop-color="#047857" />
      <stop offset="30%" stop-color="#10B981" />
      <stop offset="65%" stop-color="#2DD4A7" />
      <stop offset="100%" stop-color="#6EE7B7" />
    </linearGradient>

    <!-- Ribbon Shadow/Fold Gradient -->
    <linearGradient id="fl-shadow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064E3B" />
      <stop offset="60%" stop-color="#047857" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>

    <!-- Specular Rim Light -->
    <linearGradient id="fl-highlight-grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.1" />
      <stop offset="50%" stop-color="#5EEAD4" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#E6FFFA" stop-opacity="0.95" />
    </linearGradient>

    <!-- Floating Orb Radial 3D Gradient -->
    <radialGradient id="fl-orb-3d" cx="36%" cy="34%" r="62%">
      <stop offset="0%" stop-color="#CCFBF1" />
      <stop offset="28%" stop-color="#5EEAD4" />
      <stop offset="65%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#064E3B" />
    </radialGradient>

    <!-- i-dot 3D sphere gradient -->
    <radialGradient id="i-dot-grad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#E6FFFA" />
      <stop offset="40%" stop-color="#2DD4A7" />
      <stop offset="85%" stop-color="#0D9488" />
      <stop offset="100%" stop-color="#042F2E" />
    </radialGradient>
  </defs>

  <style>
    .brand-wordmark {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", Montserrat, sans-serif;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .brand-tagline {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", sans-serif;
      font-weight: 700;
      font-size: 11.5px;
      letter-spacing: 0.38em;
      fill: #2DD4A7;
    }
  </style>

  <!-- Left Logo Symbol -->
  <g transform="translate(6, 4) scale(0.54)">
    <!-- Back Loop Curve -->
    <path
      d="M 52 92 C 32 86 24 64 36 46 C 46 30 72 24 96 34 C 114 42 122 62 116 80 C 110 94 92 108 72 114 C 54 120 38 116 28 106"
      stroke="url(#fl-shadow-grad)"
      stroke-width="17"
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.75"
    />

    <!-- Main Front 3D Helix Ribbon -->
    <path
      d="M 28 106 C 18 94 18 72 32 54 C 44 38 68 28 92 34 C 112 40 120 58 116 74 C 110 94 88 110 64 112 C 48 114 38 108 34 98 C 30 88 38 76 50 68 C 66 58 88 56 102 66"
      stroke="url(#fl-front-grad)"
      stroke-width="16"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Inner Highlight Spine -->
    <path
      d="M 32 54 C 44 38 68 28 92 34 C 112 40 120 58 116 74 C 110 94 88 110 64 112"
      stroke="url(#fl-highlight-grad)"
      stroke-width="3.5"
      stroke-linecap="round"
      fill="none"
      opacity="0.9"
    />

    <!-- Accent Crest -->
    <path
      d="M 44 72 C 58 63 78 61 90 70"
      stroke="#5EEAD4"
      stroke-width="2.5"
      stroke-linecap="round"
      fill="none"
      opacity="0.7"
    />

    <!-- Floating Orb -->
    <g transform="translate(68, 76)">
      <ellipse cx="0" cy="11" rx="10" ry="4" fill="#042F2E" opacity="0.4" />
      <circle cx="0" cy="0" r="13" fill="url(#fl-orb-3d)" />
      <circle cx="-4" cy="-4" r="3.2" fill="#FFFFFF" opacity="0.8" />
    </g>
  </g>

  <!-- Typography Right Section -->
  <g transform="translate(100, 0)">
    <!-- Wordmark "ellix" using precise vector paths for 100% typography fidelity -->
    <!-- 'e' -->
    <path
      d="M 23 48 C 23 38 31 31 42 31 C 53 31 60 38 60 49 C 60 50.5 59.8 51.5 59.5 52.5 L 31.8 52.5 C 32.5 58 36.5 61.5 42.5 61.5 C 47 61.5 50.5 59.5 52.5 57 L 58.5 60 C 55 64.5 49.5 67.5 42 67.5 C 30.5 67.5 23 59.5 23 48 Z M 51.2 46.5 C 50.8 41.5 47 37.5 41.8 37.5 C 36.8 37.5 33 41.2 32.2 46.5 L 51.2 46.5 Z"
      fill="#FFFFFF"
    />

    <!-- first 'l' -->
    <path
      d="M 67 19 L 75.5 19 L 75.5 66.5 L 67 66.5 Z"
      fill="#FFFFFF"
    />

    <!-- second 'l' -->
    <path
      d="M 83 19 L 91.5 19 L 91.5 66.5 L 83 66.5 Z"
      fill="#FFFFFF"
    />

    <!-- 'i' stem -->
    <path
      d="M 99 32 L 107.5 32 L 107.5 66.5 L 99 66.5 Z"
      fill="#FFFFFF"
    />

    <!-- 'i' dot: 3D mint orb -->
    <circle cx="103.25" cy="22" r="5.2" fill="url(#i-dot-grad)" />
    <circle cx="101.8" cy="20.5" r="1.5" fill="#FFFFFF" opacity="0.8" />

    <!-- 'x' main white stroke (top-left to bottom-right) -->
    <path
      d="M 115 32 L 124 32 L 143.5 66.5 L 134.5 66.5 Z"
      fill="#FFFFFF"
    />

    <!-- 'x' bottom-left white segment -->
    <path
      d="M 115 66.5 L 123.5 66.5 L 129.5 56 L 125 48 Z"
      fill="#FFFFFF"
    />

    <!-- 'x' top-right mint accent slash (Signature Brand Identity Feature) -->
    <path
      d="M 129 49 L 134.5 40 L 144 32 L 135 32 L 127 44.5 Z"
      fill="#2DD4A7"
    />

    <!-- Subtitle "C O N N E C T" -->
    <text x="24" y="82" class="brand-tagline">CONNECT</text>
  </g>
</svg>`;

async function main() {
  const publicLogoDir = path.resolve('public/assets/logo');
  const publicDir = path.resolve('public');
  fs.mkdirSync(publicLogoDir, { recursive: true });

  // Write SVGs
  fs.writeFileSync(path.join(publicLogoDir, 'ellix-connect-symbol.svg'), symbolSvg, 'utf8');
  fs.writeFileSync(path.join(publicLogoDir, 'ellix-connect-logo.svg'), fullLogoSvg, 'utf8');
  
  // Also update public root SVGs
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), symbolSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), symbolSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), fullLogoSvg, 'utf8');

  console.log('SVGs created successfully.');

  // Render High-Resolution Raster PNGs using sharp
  // 1. Full Logo PNG (760 x 184 @2x retina)
  await sharp(Buffer.from(fullLogoSvg))
    .resize(760, 184)
    .png()
    .toFile(path.join(publicLogoDir, 'ellix-connect-logo.png'));
  console.log('ellix-connect-logo.png generated');

  // 2. Symbol PNG (320 x 320 @2x retina)
  await sharp(Buffer.from(symbolSvg))
    .resize(320, 320)
    .png()
    .toFile(path.join(publicLogoDir, 'ellix-connect-symbol.png'));
  console.log('ellix-connect-symbol.png generated');

  // 3. PWA icon-192.png
  await sharp(Buffer.from(symbolSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('icon-192.png generated');

  // 4. PWA icon-512.png
  await sharp(Buffer.from(symbolSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('icon-512.png generated');

  console.log('All brand assets successfully generated!');
}

main().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
