const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function createPNG(width, height, getPixel) {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.concat([t, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcBuf), 0);
    return Buffer.concat([len, t, data, crc]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Draw Ellix Connect Icon:
// Dark Slate #0f172a rounded squircle with 3-tier isometric layers
function getIconPixel(x, y, w, h) {
  // Normalize to 0..1
  const nx = x / w;
  const ny = y / h;

  // Squircle background with rounded corners (radius ~22% of size)
  const cx = 0.5;
  const cy = 0.5;
  const radius = 0.22;
  const half = 0.5;
  
  // Distance from squircle edge
  const dx = Math.abs(nx - cx);
  const dy = Math.abs(ny - cy);
  const innerLimit = half - radius;

  let inside = false;
  if (dx <= half && dy <= half) {
    if (dx <= innerLimit || dy <= innerLimit) {
      inside = true;
    } else {
      const cornerDist = Math.hypot(dx - innerLimit, dy - innerLimit);
      if (cornerDist <= radius) {
        inside = true;
      }
    }
  }

  if (!inside) {
    return [0, 0, 0, 0]; // Transparent outside
  }

  // Border check
  const borderThick = 0.015;
  let isBorder = false;
  if (dx >= half - borderThick || dy >= half - borderThick) {
    isBorder = true;
  } else if (dx > innerLimit && dy > innerLimit) {
    const cornerDist = Math.hypot(dx - innerLimit, dy - innerLimit);
    if (cornerDist >= radius - borderThick) {
      isBorder = true;
    }
  }

  if (isBorder) {
    return [30, 41, 59, 255]; // #1e293b (Slate-800 border)
  }

  // Base background: Slate-900 #0f172a
  let r = 15;
  let g = 23;
  let b = 42;

  // Isometric Diamond Function
  // Returns normalized distance to diamond center line or facet
  // Diamond 1 (Top diamond): Center (0.5, 0.36), Half-width 0.25, Half-height 0.13
  const topCx = 0.5;
  const topCy = 0.36;
  const d1x = Math.abs(nx - topCx) / 0.25;
  const d1y = Math.abs(ny - topCy) / 0.13;
  const topDiamond = d1x + d1y;

  if (topDiamond <= 1.0) {
    // Inside top diamond facet! Emerald #10b981 to Teal #14b8a6 gradient
    const gradFactor = (nx - (topCx - 0.25)) / 0.5;
    // Gradient from emerald-500 [16, 185, 129] to teal-500 [20, 184, 166]
    r = Math.round(16 + gradFactor * 4);
    g = Math.round(185 - gradFactor * 1);
    b = Math.round(129 + gradFactor * 37);

    // Center light dot
    const dotDist = Math.hypot(nx - topCx, ny - topCy);
    if (dotDist < 0.03) {
      return [255, 255, 255, 255];
    }
    return [r, g, b, 255];
  }

  // Stroke checker for chevron/layer:
  // Layer 2 (Middle chevron): y = 0.49 + |x - 0.5| * (0.13 / 0.25)
  // Stroke thickness ~ 0.04
  const slope = 0.13 / 0.25;
  const l2y = 0.50 + Math.abs(nx - 0.5) * slope;
  const l2dist = Math.abs(ny - l2y);
  if (Math.abs(nx - 0.5) <= 0.26 && l2dist <= 0.024) {
    // Emerald-400 #34d399 to Emerald-500 #10b981
    return [52, 211, 153, 255];
  }

  // Layer 3 (Bottom chevron): y = 0.63 + |x - 0.5| * (0.13 / 0.25)
  const l3y = 0.64 + Math.abs(nx - 0.5) * slope;
  const l3dist = Math.abs(ny - l3y);
  if (Math.abs(nx - 0.5) <= 0.26 && l3dist <= 0.024) {
    // Emerald-600 #059669
    return [5, 150, 105, 255];
  }

  // Subtle radial glow around center
  const centerGlow = Math.hypot(nx - 0.5, ny - 0.5);
  if (centerGlow < 0.35) {
    const glowIntensity = (1 - centerGlow / 0.35) * 0.15;
    r = Math.round(r + 16 * glowIntensity);
    g = Math.round(g + 185 * glowIntensity);
    b = Math.round(b + 129 * glowIntensity);
  }

  return [r, g, b, 255];
}

const publicDir = path.join(__dirname, '..', 'public');

// Generate icon-192.png
const png192 = createPNG(192, 192, getIconPixel);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);
console.log('Created public/icon-192.png (bytes:', png192.length, ')');

// Generate icon-512.png
const png512 = createPNG(512, 512, getIconPixel);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);
console.log('Created public/icon-512.png (bytes:', png512.length, ')');
