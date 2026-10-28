import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.resolve(process.cwd(), 'public');
fs.mkdirSync(publicDir, { recursive: true });

const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#050811"/>
    </radialGradient>
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="dieFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
  </defs>

  <!-- App Icon Background (No alpha for App Store Connect compliance) -->
  <rect width="1024" height="1024" fill="url(#bgGrad)"/>
  <rect x="44" y="44" width="936" height="936" rx="190" fill="none" stroke="url(#goldBorder)" stroke-width="18"/>

  <!-- Dungeon Grid Silhouette -->
  <g stroke="#38bdf8" stroke-opacity="0.28" stroke-width="8" fill="none">
    <rect x="160" y="160" width="704" height="704" rx="48"/>
    <line x1="395" y1="160" x2="395" y2="864"/>
    <line x1="629" y1="160" x2="629" y2="864"/>
    <line x1="160" y1="395" x2="864" y2="395"/>
    <line x1="160" y1="629" x2="864" y2="629"/>
  </g>

  <!-- Center Isometric Golden Die Cube -->
  <rect x="272" y="252" width="480" height="480" rx="88" fill="url(#dieFace)" stroke="url(#goldBorder)" stroke-width="24"/>

  <!-- 5 Pips (Crimson Center + Dark Navy Corners) -->
  <circle cx="380" cy="360" r="38" fill="#0f172a"/>
  <circle cx="644" cy="360" r="38" fill="#0f172a"/>
  <circle cx="512" cy="492" r="48" fill="#e11d48"/>
  <circle cx="380" cy="624" r="38" fill="#0f172a"/>
  <circle cx="644" cy="624" r="38" fill="#0f172a"/>

  <!-- Architect Crown Emblem -->
  <path d="M390 215 L450 155 L512 205 L574 155 L634 215 Z" fill="#facc15"/>
</svg>`;

const splashSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="2732" height="2732" viewBox="0 0 2732 2732" xmlns="http://www.w3.org/2000/svg">
  <rect width="2732" height="2732" fill="#070a12"/>
  <circle cx="1366" cy="1220" r="320" fill="#1e293b" stroke="#facc15" stroke-width="14"/>
  <text x="1366" y="1265" font-size="220" text-anchor="middle" fill="#facc15" font-family="sans-serif" font-weight="900">🎲</text>
  <text x="1366" y="1680" font-size="88" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-weight="900">주사위 던전 건축가</text>
  <text x="1366" y="1790" font-size="48" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-weight="700">DICE ARCHITECT</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon-1024.svg'), iconSvg, 'utf8');
fs.writeFileSync(path.join(publicDir, 'splash-2732.svg'), splashSvg, 'utf8');
console.log('Generated public/icon-1024.svg and public/splash-2732.svg successfully.');
