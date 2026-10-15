import { cpSync, mkdirSync } from 'node:fs';

// Vite fingerprints <img> sources, but book-preview anchors need stable paths.
mkdirSync('dist/assets/img/projects', { recursive: true });
cpSync('assets/img/projects/books', 'dist/assets/img/projects/books', { recursive: true });
// Keep the selected About photos available through their full-size links.
cpSync('assets/img/about', 'dist/assets/img/about', { recursive: true });
// Preserve the stable social-preview image URL as well as the CSS fingerprint.
cpSync('assets/img/gallery-room-square.webp', 'dist/assets/img/gallery-room-square.webp');
cpSync('CNAME', 'dist/CNAME');
