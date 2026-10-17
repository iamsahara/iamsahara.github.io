# Sahar's gallery

The portfolio for [iamsahara.com](https://iamsahara.com) is a neon gallery with three rooms: Products, Bookshelf, and About. The gallery is the homepage; `/gallery.html` redirects to it while preserving room links.

## Local development

```sh
npm ci
npm run dev -- --host 127.0.0.1
npm run build
npm run preview -- --host 127.0.0.1
```

The site also works through a static HTTP server. `index.html` contains the gallery and its canonical portfolio content in `#portfolio-content`. `assets/js/gallery.js` reads that template directly, avoiding a second HTML request. Presentation lives in `assets/css/main.css` and `assets/css/gallery.css`.

## Rooms

- Products (`#projects`): AdaBudget, ProsPix, LuxShades, AdaHome, AdaPay, and MedPass. Selecting a frame opens a centered detail dialog. A public GitHub contribution calendar appears above them.
- Bookshelf (`#books`): My First Persian Alphabet, MY IRAN: Landmarks & Architecture, and IRAN: Patterns & Decorative Arts. Books sit on a wall shelf; phones show a swipeable shelf with previous/next controls. All three books link to their Amazon.ca paperback listings, verified against the retail titles and product details on October 17, 2026: `B0HLD7KHC4` (Alphabet), `B0HN99T1H5` (Landmarks), and `B0HN9BMM8T` (Patterns).
- About (`#about`): the approved short biography, selected current portrait, and keyboard-cat photo in a wall-mounted banner. The biography has no separate scroll area. About is a normal room, not a popup.

The top navigation contains only the three room buttons. The former corner wordmark, "Current layout" link, and résumé link are absent. Direct room links and browser Back/Forward work. Dialogs support Escape, outside-click dismissal, focus containment, and return focus.

## Responsive scene and tools

Scenery and exhibits share one scrollable stage. All three rooms use shared camera bounds measured from the tallest exhibit. Background images retain their natural proportions, with portrait, close, square, and landscape artwork selected by viewport aspect ratio. Inactive rooms remain measurable but invisible, inert, and hidden from assistive navigation.

A moving strip of 36 software engineering tools and technologies sits beneath the exhibits, above the floor boundary. Every item has an icon and label; sources and licenses are in `assets/img/logo/SOURCES.md`. Duplicates are hidden from assistive technology. Motion pauses on hover/focus or with the pause button. Reduced-motion preferences show a static, horizontally scrollable list.

## GitHub activity and analytics

`assets/js/github-activity.js` loads public contribution data for `iamsahara` from [github-contributions-api](https://github.com/grubersjoe/github-contributions-api), with a rolling six-month UTC window. No GitHub token or private repository access is included. The calendar reserves its loading space so data arrival does not move the room. Its title, totals, and date summary are visually hidden while accessible descriptions remain. The GitHub link and intensity legend stay visible.

```sh
node scripts/contribution-window.test.mjs
```

The existing ProsPix production endpoints and opt-in consent setting are preserved in `assets/js/analytics.js`. The script loads only on the existing production hostnames, never on local previews.

## Publication

GitHub Pages serves the repository root on `main`, with `CNAME` retaining `iamsahara.com`. Merging into `main` publishes the site. Build output also preserves stable cover/photo links and the social-preview image. The gallery homepage is indexable and declares its canonical production URL; the old gallery URL is a compatibility redirect.

Check the actual deployed homepage, all three rooms, dialogs, artwork, and icons after publication. Local tests alone do not establish a live deployment.
